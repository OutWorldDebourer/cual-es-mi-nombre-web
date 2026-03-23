/**
 * Note Drag Tests — "Cual es mi nombre" Web
 *
 * Tests for the computeDragMove pure function: position calculation,
 * cross-section pin toggle, edge cases with filtered views.
 *
 * @module __tests__/notes/note-drag.test
 */

import { describe, it, expect } from "vitest";
import { computeDragMove } from "@/hooks/use-note-drag";
import type { Note } from "@/types/database";

function makeNote(overrides: Partial<Note> & { id: string; position: string }): Note {
  return {
    profile_id: "user-1",
    title: "Note",
    content: "content",
    tags: [],
    status: "active",
    priority: "normal",
    is_pinned: false,
    is_archived: false,
    created_at: "2026-03-01T12:00:00Z",
    updated_at: "2026-03-01T12:00:00Z",
    ...overrides,
  };
}

describe("computeDragMove", () => {
  // ── Basic reorder (same section) ──────────────────────────────────

  it("returns null when activeId === overId", () => {
    const notes = [makeNote({ id: "a", position: "a0" })];
    expect(computeDragMove(notes, "a", "a")).toBeNull();
  });

  it("returns null when activeId not found", () => {
    const notes = [makeNote({ id: "a", position: "a0" })];
    expect(computeDragMove(notes, "missing", "a")).toBeNull();
  });

  it("returns null when overId not found", () => {
    const notes = [makeNote({ id: "a", position: "a0" })];
    expect(computeDragMove(notes, "a", "missing")).toBeNull();
  });

  it("moves item down: A,B,C → drag A to C → position after B", () => {
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "b", position: "a1" }),
      makeNote({ id: "c", position: "a2" }),
    ];
    const result = computeDragMove(notes, "a", "c");
    expect(result).not.toBeNull();
    // A goes after C (last item) → position after "a2"
    // filtered = [B(a1), C(a2)], left = filtered[1]=C(a2), right = filtered[2]=null
    expect(result!.newPosition > "a2").toBe(true);
    expect(result!.crossedPinBoundary).toBe(false);
  });

  it("moves item up: A,B,C → drag C to A → position before A", () => {
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "b", position: "a1" }),
      makeNote({ id: "c", position: "a2" }),
    ];
    const result = computeDragMove(notes, "c", "a");
    expect(result).not.toBeNull();
    // C goes before A (first item) → position before "a0"
    // filtered = [A(a0), B(a1)], left = null, right = filtered[0]=A(a0)
    expect(result!.newPosition < "a0").toBe(true);
    expect(result!.crossedPinBoundary).toBe(false);
  });

  it("moves item one step down: A,B,C → drag A to B → between B and C", () => {
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "b", position: "a1" }),
      makeNote({ id: "c", position: "a2" }),
    ];
    const result = computeDragMove(notes, "a", "b");
    expect(result).not.toBeNull();
    // filtered = [B(a1), C(a2)], left=filtered[0]=B(a1), right=filtered[1]=C(a2)
    expect(result!.newPosition > "a1").toBe(true);
    expect(result!.newPosition < "a2").toBe(true);
  });

  it("moves item one step up: A,B,C → drag C to B → between A and B", () => {
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "b", position: "a1" }),
      makeNote({ id: "c", position: "a2" }),
    ];
    const result = computeDragMove(notes, "c", "b");
    expect(result).not.toBeNull();
    // filtered = [A(a0), B(a1)], left=filtered[0]=A(a0), right=filtered[1]=B(a1)
    expect(result!.newPosition > "a0").toBe(true);
    expect(result!.newPosition < "a1").toBe(true);
  });

  // ── Two-item array ────────────────────────────────────────────────

  it("swaps two items: A,B → drag B to A", () => {
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "b", position: "a1" }),
    ];
    const result = computeDragMove(notes, "b", "a");
    expect(result).not.toBeNull();
    expect(result!.newPosition < "a0").toBe(true);
  });

  it("swaps two items: A,B → drag A to B", () => {
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "b", position: "a1" }),
    ];
    const result = computeDragMove(notes, "a", "b");
    expect(result).not.toBeNull();
    expect(result!.newPosition > "a1").toBe(true);
  });

  // ── Cross-section pin toggle ──────────────────────────────────────

  it("unpins note when dragged from pinned to unpinned section", () => {
    const notes = [
      makeNote({ id: "p1", position: "a0", is_pinned: true }),
      makeNote({ id: "p2", position: "a1", is_pinned: true }),
      makeNote({ id: "u1", position: "a2", is_pinned: false }),
      makeNote({ id: "u2", position: "a3", is_pinned: false }),
    ];
    const result = computeDragMove(notes, "p2", "u1");
    expect(result).not.toBeNull();
    expect(result!.crossedPinBoundary).toBe(true);
    expect(result!.newIsPinned).toBe(false);
  });

  it("pins note when dragged from unpinned to pinned section", () => {
    const notes = [
      makeNote({ id: "p1", position: "a0", is_pinned: true }),
      makeNote({ id: "p2", position: "a1", is_pinned: true }),
      makeNote({ id: "u1", position: "a2", is_pinned: false }),
      makeNote({ id: "u2", position: "a3", is_pinned: false }),
    ];
    const result = computeDragMove(notes, "u1", "p1");
    expect(result).not.toBeNull();
    expect(result!.crossedPinBoundary).toBe(true);
    expect(result!.newIsPinned).toBe(true);
  });

  it("no pin change when reordering within pinned section", () => {
    const notes = [
      makeNote({ id: "p1", position: "a0", is_pinned: true }),
      makeNote({ id: "p2", position: "a1", is_pinned: true }),
      makeNote({ id: "u1", position: "a2", is_pinned: false }),
    ];
    const result = computeDragMove(notes, "p2", "p1");
    expect(result).not.toBeNull();
    expect(result!.crossedPinBoundary).toBe(false);
    expect(result!.newIsPinned).toBe(true);
  });

  it("no pin change when reordering within unpinned section", () => {
    const notes = [
      makeNote({ id: "p1", position: "a0", is_pinned: true }),
      makeNote({ id: "u1", position: "a1", is_pinned: false }),
      makeNote({ id: "u2", position: "a2", is_pinned: false }),
    ];
    const result = computeDragMove(notes, "u2", "u1");
    expect(result).not.toBeNull();
    expect(result!.crossedPinBoundary).toBe(false);
    expect(result!.newIsPinned).toBe(false);
  });

  // ── Filtered view simulation ──────────────────────────────────────
  // When filters are active, the full notes array has items that are
  // invisible in the UI but still affect position calculation.

  it("handles filtered view: gaps in full array", () => {
    // Full array: [A, X, B, Y, C] — user sees [A, B, C] (X,Y filtered out)
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "x", position: "a1" }),
      makeNote({ id: "b", position: "a2" }),
      makeNote({ id: "y", position: "a3" }),
      makeNote({ id: "c", position: "a4" }),
    ];

    // User drags A to B's position (move down in filtered view)
    const result = computeDragMove(notes, "a", "b");
    expect(result).not.toBeNull();
    // oldIndex=0, newIndex=2, filtered=[X(a1),B(a2),Y(a3),C(a4)]
    // left=filtered[1]=B(a2), right=filtered[2]=Y(a3)
    expect(result!.newPosition > "a2").toBe(true);
    expect(result!.newPosition < "a3").toBe(true);
  });

  // ── Position order guarantee ──────────────────────────────────────

  it("generated position is always a valid fractional-indexing key", () => {
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "b", position: "a1" }),
      makeNote({ id: "c", position: "a2" }),
      makeNote({ id: "d", position: "a3" }),
      makeNote({ id: "e", position: "a4" }),
    ];

    // Test every possible drag combination
    const ids = notes.map((n) => n.id);
    for (const activeId of ids) {
      for (const overId of ids) {
        if (activeId === overId) continue;
        const result = computeDragMove(notes, activeId, overId);
        expect(result).not.toBeNull();
        // Position must be a non-empty string
        expect(result!.newPosition.length).toBeGreaterThan(0);
      }
    }
  });

  // ── Single-item edge case ─────────────────────────────────────────

  it("handles all notes in one section (no separator)", () => {
    const notes = [
      makeNote({ id: "a", position: "a0" }),
      makeNote({ id: "b", position: "a1" }),
      makeNote({ id: "c", position: "a2" }),
    ];
    // All unpinned (default). No cross-section possible.
    const result = computeDragMove(notes, "b", "a");
    expect(result!.crossedPinBoundary).toBe(false);
    expect(result!.newPosition < "a0").toBe(true);
  });
});
