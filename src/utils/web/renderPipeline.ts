
export function initWithErrorWrapper(
  f: () => void,
  pipelineName: string,
  enableLogging = false
) {
  if (enableLogging)
    console.time(`Render pipeline init function for pipeline '${pipelineName}`);

  try {
    f();
  } catch (err) {
    const errMsg = `Error in render pipeline '${pipelineName}' on init stage`;
    if (err instanceof Error) {
      err.message = `${errMsg} -- ${err.message}`;
      throw err;
    }
    throw new Error(errMsg);
  }

  if (enableLogging)
    console.timeEnd(`Render pipeline init function for pipeline '${pipelineName}`);
}

export function renderWithErrorWrapper(
  f: () => void,
  pipelineName: string,
  enableLogging = false
) {
  if (enableLogging)
    console.time(`Render pipeline render function for pipeline '${pipelineName}`);

  try {
    f();
  } catch (err) {
    const errMsg = `Error in render pipeline '${pipelineName}' on render stage`;
    if (err instanceof Error) {
      err.message = `${errMsg} -- ${err.message}`;
      throw err;
    }
    throw new Error(errMsg);
  }

  if (enableLogging)
    console.timeEnd(`Render pipeline render function for pipeline '${pipelineName}`);
}
