import type { Assignment } from "../data/types";
import { addDays } from "../data/dates";
import { deepFreeze } from "./deep-freeze";

/**
 * FAKE assignments. Due dates are relative to `today` so the demo always has work to show.
 * All story titles and content are made up.
 */
export function createAssignments(today: string): readonly Assignment[] {
  const tomorrow = addDays(today, 1);

  return deepFreeze([
    // Grade 1: short steps with picture cues.
    {
      id: "asg-g1-reading-mitten",
      classId: "cls-g1-reading",
      title: "Story time: The Lost Mitten",
      estimatedMinutes: 15,
      dueDate: today,
      steps: [
        { id: "s1", text: "Find the book with the blue mitten.", icon: "read" },
        { id: "s2", text: "Read the story with a buddy.", icon: "read" },
        { id: "s3", text: "Draw where the mitten was found.", icon: "draw" },
      ],
    },
    {
      id: "asg-g1-math-count",
      classId: "cls-g1-math",
      title: "Count to 20",
      estimatedMinutes: 10,
      dueDate: today,
      steps: [
        { id: "s1", text: "Get your counting blocks.", icon: "count" },
        { id: "s2", text: "Count them one by one.", icon: "count" },
        { id: "s3", text: "Write the number you got.", icon: "write" },
      ],
    },
    {
      id: "asg-g1-science-leaf",
      classId: "cls-g1-science",
      title: "Look closely at a leaf",
      estimatedMinutes: 15,
      dueDate: today,
      steps: [
        { id: "s1", text: "Pick up one leaf from the bin.", icon: "think" },
        { id: "s2", text: "Look at its shape and color.", icon: "think" },
        { id: "s3", text: "Draw your leaf.", icon: "draw" },
      ],
    },
    {
      id: "asg-g1-art-shapes",
      classId: "cls-g1-art",
      title: "Make a picture with shapes",
      estimatedMinutes: 20,
      dueDate: today,
      steps: [
        { id: "s1", text: "Pick three shapes.", icon: "think" },
        { id: "s2", text: "Use them to make an animal.", icon: "draw" },
      ],
    },
    {
      id: "asg-g1-math-shapes",
      classId: "cls-g1-math",
      title: "Find shapes in the room",
      estimatedMinutes: 10,
      dueDate: tomorrow,
      steps: [
        { id: "s1", text: "Look for a circle, a square, and a triangle.", icon: "think" },
        { id: "s2", text: "Draw each one you find.", icon: "draw" },
      ],
    },

    // Grade 4: more text, still one small step at a time.
    {
      id: "asg-g4-math-fractions",
      classId: "cls-g4-math",
      title: "Fractions on a number line",
      estimatedMinutes: 20,
      dueDate: today,
      steps: [
        { id: "s1", text: "Draw a number line from 0 to 1 on your worksheet." },
        { id: "s2", text: "Split it into four equal parts and label each mark." },
        { id: "s3", text: "Place 1/2 and 3/4 on the line. Check that 2/4 lands on the same spot as 1/2." },
      ],
    },
    {
      id: "asg-g4-reading-chapter",
      classId: "cls-g4-reading",
      title: "Read chapter 3 of The Clockwork Garden",
      estimatedMinutes: 25,
      dueDate: today,
      steps: [
        { id: "s1", text: "Read chapter 3 quietly at your desk." },
        { id: "s2", text: "Write two sentences about what the main character wanted." },
        { id: "s3", text: "Write one question you still have about the story." },
      ],
    },
    {
      id: "asg-g4-social-map",
      classId: "cls-g4-social",
      title: "Label the map of Sampleton",
      estimatedMinutes: 20,
      dueDate: today,
      steps: [
        { id: "s1", text: "Find the river, the school, and the library on the map of Sampleton." },
        { id: "s2", text: "Add a compass rose in the corner." },
        { id: "s3", text: "Draw a path from the school to the library." },
      ],
    },
    {
      id: "asg-g4-music-rhythm",
      classId: "cls-g4-music",
      title: "Clap a rhythm pattern",
      estimatedMinutes: 10,
      dueDate: tomorrow,
      steps: [
        { id: "s1", text: "Look at the rhythm card your teacher gives you." },
        { id: "s2", text: "Clap it slowly, then at full speed." },
      ],
    },
  ]);
}
