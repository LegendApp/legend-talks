/** Source measurements stay in MiB; presentation values use decimal MB. */
export function displayMetric(value: number, metric: string) {
  return metric === "memory" || metric === "size" ? value * 1.048576 : value;
}
