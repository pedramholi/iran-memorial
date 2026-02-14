import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit()", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows first request and returns correct remaining count", () => {
    const result = rateLimit("1.2.3.4", "test-first", 5, 60);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("decrements remaining on subsequent requests", () => {
    const ip = "10.0.0.1";
    const ep = "test-dec";
    rateLimit(ip, ep, 5, 60);
    const r2 = rateLimit(ip, ep, 5, 60);
    expect(r2.remaining).toBe(3);
    const r3 = rateLimit(ip, ep, 5, 60);
    expect(r3.remaining).toBe(2);
  });

  it("blocks request when limit is exceeded", () => {
    const ip = "10.0.0.2";
    const ep = "test-block";
    rateLimit(ip, ep, 3, 60);
    rateLimit(ip, ep, 3, 60);
    rateLimit(ip, ep, 3, 60);
    const result = rateLimit(ip, ep, 3, 60);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const ip = "10.0.0.3";
    const ep = "test-reset";
    rateLimit(ip, ep, 2, 60);
    rateLimit(ip, ep, 2, 60);
    const blocked = rateLimit(ip, ep, 2, 60);
    expect(blocked.success).toBe(false);

    vi.advanceTimersByTime(61 * 1000);

    const result = rateLimit(ip, ep, 2, 60);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("tracks different IPs independently", () => {
    const ep = "test-ips";
    rateLimit("a.a.a.a", ep, 1, 60);
    const blocked = rateLimit("a.a.a.a", ep, 1, 60);
    expect(blocked.success).toBe(false);

    const result = rateLimit("b.b.b.b", ep, 1, 60);
    expect(result.success).toBe(true);
  });

  it("tracks different endpoints independently", () => {
    const ip = "10.0.0.4";
    rateLimit(ip, "ep-a", 1, 60);
    const blocked = rateLimit(ip, "ep-a", 1, 60);
    expect(blocked.success).toBe(false);

    const result = rateLimit(ip, "ep-b", 1, 60);
    expect(result.success).toBe(true);
  });

  it("returns correct resetAt timestamp", () => {
    const now = Date.now();
    const result = rateLimit("10.0.0.5", "test-time", 10, 120);
    expect(result.resetAt).toBe(now + 120 * 1000);
  });

  it("handles single-request limit", () => {
    const r1 = rateLimit("10.0.0.6", "test-single", 1, 60);
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(0);

    const r2 = rateLimit("10.0.0.6", "test-single", 1, 60);
    expect(r2.success).toBe(false);
  });
});
