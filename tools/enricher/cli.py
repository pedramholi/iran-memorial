"""CLI interface — argparse subcommands for the enrichment service."""

from __future__ import annotations

import argparse
import asyncio
import logging
import sys

from . import __version__
from .config import load_config
from .db.models import RunStats
from .sources import list_plugins


def setup_logging(level: str) -> None:
    """Configure logging."""
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%H:%M:%S",
    )


def format_stats(stats: RunStats) -> str:
    """Format run statistics for display."""
    lines = [
        f"  Processed:     {stats.processed:>6}",
        f"  Matched:       {stats.matched:>6}",
        f"  Enriched:      {stats.enriched:>6}  ({stats.fields_updated} fields)",
        f"  Sources added: {stats.sources_added:>6}",
        f"  No new data:   {stats.no_new_data:>6}",
        f"  Ambiguous:     {stats.ambiguous:>6}",
        f"  Unmatched:     {stats.unmatched:>6}",
    ]
    if stats.new_imported:
        lines.append(f"  New imported:  {stats.new_imported:>6}")
    if stats.errors:
        lines.append(f"  Errors:        {stats.errors:>6}")
    return "\n".join(lines)


async def cmd_enrich(args: argparse.Namespace) -> int:
    """Run enrichment pipeline."""
    from .pipeline.orchestrator import run_all_sources, run_enrichment

    cfg = load_config(args.config)
    setup_logging(cfg.log_level if not args.verbose else "DEBUG")
    log = logging.getLogger("enricher")

    if args.all:
        results = await run_all_sources(
            database_url=cfg.database_url,
            state_dir=cfg.state_dir,
            mode=args.mode,
            dry_run=args.dry_run,
            limit=args.limit,
            batch_size=cfg.batch_size,
            resume=args.resume,
            verbose=args.verbose,
        )
        for name, stats in results.items():
            log.info(f"\n--- {name} ---\n{format_stats(stats)}")
        return 0

    if not args.source:
        print("Error: --source NAME or --all required", file=sys.stderr)
        return 1

    stats = await run_enrichment(
        source_name=args.source,
        database_url=cfg.database_url,
        state_dir=cfg.state_dir,
        mode=args.mode,
        dry_run=args.dry_run,
        limit=args.limit,
        batch_size=cfg.batch_size,
        resume=args.resume,
        verbose=args.verbose,
    )

    prefix = "[DRY RUN] " if args.dry_run else ""
    log.info(f"\n{prefix}Results:\n{format_stats(stats)}")
    return 0


async def cmd_check(args: argparse.Namespace) -> int:
    """Dry-run preview — alias for 'enrich --dry-run'."""
    args.dry_run = True
    args.mode = "enrich"
    return await cmd_enrich(args)


async def cmd_status(args: argparse.Namespace) -> int:
    """Show progress status for all sources."""
    import json
    import os

    cfg = load_config(args.config)
    progress_dir = os.path.join(cfg.state_dir, "progress")

    if not os.path.exists(progress_dir):
        print("No progress data yet.")
        return 0

    for filename in sorted(os.listdir(progress_dir)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(progress_dir, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            data = json.load(f)

        source = data.get("source", filename)
        last_run = data.get("last_run", "never")
        processed = len(data.get("processed_ids", []))
        stats = data.get("stats", {})

        print(f"\n{source}:")
        print(f"  Last run:   {last_run}")
        print(f"  Processed:  {processed}")
        if stats:
            for k, v in stats.items():
                print(f"  {k}: {v}")

    return 0


async def cmd_list(args: argparse.Namespace) -> int:
    """List available source plugins."""
    plugins = list_plugins()
    if not plugins:
        print("No plugins registered.")
        return 0

    from .sources import get_plugin

    print(f"\nAvailable sources ({len(plugins)}):\n")
    for name in plugins:
        cls = get_plugin(name)
        instance = cls.__new__(cls)
        print(f"  {name:<20s}  {instance.full_name}")
        print(f"  {'':20s}  {instance.base_url}")
        print()

    return 0


def build_parser() -> argparse.ArgumentParser:
    """Build the argument parser."""
    parser = argparse.ArgumentParser(
        prog="enricher",
        description="Iran Memorial — DB enrichment from external sources",
    )
    parser.add_argument(
        "--version", action="version", version=f"enricher {__version__}"
    )
    parser.add_argument(
        "--config", "-c",
        help="Path to enricher.toml config file",
        default=None,
    )

    sub = parser.add_subparsers(dest="command", required=True)

    # --- enrich ---
    p_enrich = sub.add_parser(
        "enrich", help="Run enrichment pipeline"
    )
    p_enrich.add_argument(
        "--source", "-s", help="Source plugin name"
    )
    p_enrich.add_argument(
        "--all", "-a", action="store_true",
        help="Run all registered sources",
    )
    p_enrich.add_argument(
        "--mode", "-m", default="enrich",
        choices=["enrich", "import-new", "full"],
        help="Mode: enrich (fill NULLs), import-new (add unmatched), full (both)",
    )
    p_enrich.add_argument(
        "--dry-run", "-n", action="store_true",
        help="Preview without writing to DB",
    )
    p_enrich.add_argument(
        "--resume", "-r", action="store_true",
        help="Resume from last progress",
    )
    p_enrich.add_argument(
        "--limit", "-l", type=int, default=None,
        help="Max entries to process",
    )
    p_enrich.add_argument(
        "--verbose", "-v", action="store_true",
        help="Verbose output",
    )

    # --- check ---
    p_check = sub.add_parser(
        "check", help="Dry-run preview (alias for enrich --dry-run)"
    )
    p_check.add_argument("--source", "-s", help="Source plugin name")
    p_check.add_argument(
        "--all", "-a", action="store_true",
        help="Check all sources",
    )
    p_check.add_argument(
        "--resume", "-r", action="store_true",
        help="Resume from last progress",
    )
    p_check.add_argument(
        "--limit", "-l", type=int, default=None,
        help="Max entries to check",
    )
    p_check.add_argument(
        "--verbose", "-v", action="store_true",
        help="Verbose output",
    )
    p_check.add_argument("--config", dest="_config_dup", help=argparse.SUPPRESS)

    # --- status ---
    sub.add_parser("status", help="Show progress status for all sources")

    # --- list ---
    sub.add_parser("list", help="List available source plugins")

    return parser


def main() -> None:
    """CLI entry point."""
    parser = build_parser()
    args = parser.parse_args()

    commands = {
        "enrich": cmd_enrich,
        "check": cmd_check,
        "status": cmd_status,
        "list": cmd_list,
    }

    handler = commands.get(args.command)
    if not handler:
        parser.print_help()
        sys.exit(1)

    try:
        exit_code = asyncio.run(handler(args))
    except KeyboardInterrupt:
        print("\nAborted.")
        exit_code = 130
    except Exception as e:
        logging.getLogger("enricher").error(f"Fatal: {e}", exc_info=True)
        exit_code = 1

    sys.exit(exit_code)
