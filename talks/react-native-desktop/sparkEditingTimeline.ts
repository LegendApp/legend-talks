export const sparkEditPrompt = "Change the Settings appearance text color to #58D6C7.";
export const sparkEditDuration = 8;
export const sparkEditLoopDuration = 10;
const typingStart = 1.05;
const typingEnd = typingStart + sparkEditPrompt.length * 0.045;
const generationStart = typingEnd + 0.5;
const generationEnd = generationStart + 3;

export function sampleSparkEdit(seconds: number) {
  "worklet";
  const time = seconds % sparkEditLoopDuration;
  const characters = time >= generationEnd + 0.55 ? 0 : Math.min(sparkEditPrompt.length, Math.max(0, Math.floor((time - typingStart) / 0.045)));
  const generating = time >= generationStart && time < generationEnd;
  const result = Math.min(1, Math.max(0, (time - generationEnd) / 0.55));
  const reset = Math.min(1, Math.max(0, (time - 9) / 0.55));
  const resetOpacity = 1 - reset * reset * (3 - 2 * reset);
  return {
    text: sparkEditPrompt.slice(0, characters),
    characters,
    input: time >= typingStart ? resetOpacity : 0,
    caret: time >= typingStart && time < generationStart && Math.floor(time * 2) % 2 === 0 ? 1 : 0,
    generating,
    spin: generating ? (time - generationStart) * Math.PI * 2 : 0,
    result: result * result * (3 - 2 * result) * resetOpacity,
  };
}
