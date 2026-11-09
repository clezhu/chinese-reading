import { Form, Link } from "react-router";
import type { Lesson } from "../content/curriculum";
import type { LessonProgress, LessonStatus } from "../lib/progress.server";

const statusLabels: Record<LessonStatus, string> = {
  available: "", locked: "Locked", "in-progress": "In progress", completed: "Completed",
};

// A shared renderer accepts either lesson kind without publishing a revision.
export function LessonCard({ lesson, status, number, phase, attemptId, guidance }: {
  lesson: Lesson;
  status: LessonStatus;
  number: number;
  phase?: LessonProgress["phase"];
  attemptId?: string;
  guidance?: "Start here" | "Continue here";
}) {
  const activeRevisit = status === "completed" && phase != null && phase !== "complete";
  const contents = <>
    <h3 className="sr-only">{lesson.title}</h3>
    <span className="lesson-number" aria-hidden="true">{number}</span>
    {status === "completed" && <span className="completion-badge" aria-hidden="true">✓</span>}
    <span className={`tile-status${guidance ? " tile-guidance" : ""}`}>{guidance ?? statusLabels[status]}</span>
    {guidance && statusLabels[status] && <span className="sr-only">{statusLabels[status]}</span>}
    <span className="tile-characters" lang={lesson.kind === "learning" ? "zh-Hans" : undefined}>{lesson.kind === "learning" ? lesson.newCharacters.map((character) => <span key={character.id}>{character.hanzi}</span>) : "Revision"}</span>
    {lesson.kind === "revision" && <span className="sr-only">No new characters</span>}
  </>;
  const actionName = `${status === "available" ? "Start lesson" : activeRevisit ? "Resume revisit" : status === "completed" ? "Revisit lesson" : "Resume lesson"}: ${lesson.title}`;
  return <li className={`lesson-card ${status}${guidance ? " guided" : ""}`}>
    {status === "locked" ? <div className="tile-face" aria-disabled="true">{contents}<span className="sr-only">Complete the previous lesson to unlock.</span></div>
      : status === "available" || (status === "completed" && phase === "complete" && attemptId) ? <Form method="post" action={`/lessons/${lesson.id}`}>
        <input type="hidden" name="intent" value={status === "available" ? "start" : "revisit"} />
        {status === "completed" && <input type="hidden" name="attempt_id" value={attemptId} />}
        <button className="tile-face" type="submit" aria-label={actionName}>{contents}</button>
      </Form> : <Link className="tile-face" to={`/lessons/${lesson.id}`} aria-label={actionName}>{contents}</Link>}
  </li>;
}
