import { afterEach, describe, expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { parseHash, routeToHash, useRoute } from "./router";

afterEach(() => {
  window.location.hash = "";
});

describe("parseHash / routeToHash", () => {
  test("round-trips the Today and assignment routes", () => {
    expect(parseHash(routeToHash({ name: "today" }))).toEqual({ name: "today" });
    expect(parseHash(routeToHash({ name: "assignment", assignmentId: "asg-g1-math-count" }))).toEqual({
      name: "assignment",
      assignmentId: "asg-g1-math-count",
    });
  });

  test("encodes ids so unusual characters cannot break the hash", () => {
    const hash = routeToHash({ name: "assignment", assignmentId: "a/b c#d" });

    expect(hash).toBe("#/assignment/a%2Fb%20c%23d");
    expect(parseHash(hash)).toEqual({ name: "assignment", assignmentId: "a/b c#d" });
  });

  test.each(["", "#", "#/", "#/nope", "#/assignment", "#/assignment/", "#/assignment/a/b", "#/assignment/%E0%A4%A"])(
    "treats %j as Today",
    (hash) => {
      expect(parseHash(hash)).toEqual({ name: "today" });
    },
  );
});

describe("useRoute", () => {
  test("follows the URL hash as it changes (including the browser back button)", () => {
    const { result } = renderHook(() => useRoute());
    expect(result.current).toEqual({ name: "today" });

    act(() => {
      window.location.hash = "#/assignment/asg-1";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toEqual({ name: "assignment", assignmentId: "asg-1" });

    act(() => {
      window.location.hash = "#/";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toEqual({ name: "today" });
  });
});
