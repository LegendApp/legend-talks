export const sparkEditPrompt = "Change the Settings appearance text color to #58D6C7.";
export const sparkEditDuration = 8;
const typingStart = 1.05;
const typingEnd = typingStart + sparkEditPrompt.length * 0.045;
const generationStart = typingEnd + 0.5;
const generationEnd = generationStart + 3;

export function sampleSparkEdit(seconds: number) {
  "worklet";
  const characters = Math.min(sparkEditPrompt.length, Math.max(0, Math.floor((seconds - typingStart) / 0.045)));
  const generating = seconds >= generationStart && seconds < generationEnd;
  const result = Math.min(1, Math.max(0, (seconds - generationEnd) / 0.55));
  return {
    text: sparkEditPrompt.slice(0, characters),
    characters,
    input: seconds >= typingStart ? 1 : 0,
    caret: seconds >= typingStart && seconds < generationStart && Math.floor(seconds * 2) % 2 === 0 ? 1 : 0,
    generating,
    spin: generating ? (seconds - generationStart) * Math.PI * 2 : 0,
    result: result * result * (3 - 2 * result),
  };
}
