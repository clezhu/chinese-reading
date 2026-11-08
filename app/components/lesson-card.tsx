import { Form, Link } from "react-router";
import { lessonKindLabel, type Lesson } from "../content/curriculum";
import type { LessonProgress, LessonStatus } from "../lib/progress.server";

const statusLabels: Record<LessonStatus, string> = {
  available: "Available", locked: "Locked", "in-progress": "In progress", completed: "Completed",
};

// A shared renderer accepts either lesson kind without publishing a revision.
export function LessonCard({ lesson, status, number, phase, attemptId }: {
  lesson: Lesson;
  status: LessonStatus;
  number: number;
  phase?: LessonProgress["phase"];
  attemptId?: string;
}) {
  const activeRevisit = status === "completed" && phase != null && phase !== "complete";
  return (
    <li className={`lesson-card ${status}`}>
      <div className="lesson-number" aria-hidden="true">{String(number).padStart(2, "0")}</div>
      <div className="lesson-details">
        <div className="badges"><span className="badge">{lessonKindLabel(lesson)}</span><span className="status">{statusLabels[status]}</span></div>
        <h3>{lesson.title}</h3>
        <p>{lesson.description}</p>
        <p className="input-hint">{lesson.kind === "learning" ? `${lesson.newCharacters.length} new characters` : "No new characters"}</p>
      </div>
      <div className="lesson-control">
        {status === "locked" ? <p className="locked-note">Complete the previous lesson to unlock.</p>
          : status === "available" ? <Form method="post" action={`/lessons/${lesson.id}`}><input type="hidden" name="intent" value="start" /><button type="submit">Start lesson<span className="sr-only">: {lesson.title}</span></button></Form>
          : <>
            <Link className="button secondary" to={`/lessons/${lesson.id}`}>{activeRevisit ? "Resume revisit" : status === "completed" ? "View lesson" : "Resume lesson"}<span className="sr-only">: {lesson.title}</span></Link>
            {status === "completed" && phase === "complete" && attemptId && <Form method="post" action={`/lessons/${lesson.id}`}>
              <input type="hidden" name="intent" value="revisit" />
              <input type="hidden" name="attempt_id" value={attemptId} />
              <button type="submit">Revisit lesson<span className="sr-only">: {lesson.title}</span></button>
            </Form>}
          </>}
      </div>
    </li>
  );
}
