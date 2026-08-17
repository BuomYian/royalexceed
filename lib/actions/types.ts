export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export function actionError(error: unknown, fallback = "Something went wrong. Please try again."): ActionResult<never> {
  if (error instanceof Error) {
    // ForbiddenError / Zod messages are safe to surface; unexpected errors are not (no stack leakage to the client).
    if (error.name === "ForbiddenError") {
      return { success: false, error: "You don't have permission to do that." };
    }
    if (error.name === "ZodError") {
      return { success: false, error: "Please check the form for errors." };
    }
  }
  console.error(error);
  return { success: false, error: fallback };
}
