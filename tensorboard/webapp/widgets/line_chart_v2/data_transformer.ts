import {DataSeries} from './lib/types';

/**
 * Smoothed data series in y axis using smoothing algorithm from classical TensorBoard
 * circa 2019-2020. 1st-order IIR low-pass filter to attenuate the higher-frequency
 * components of the time-series.
 */
export async function classicSmoothing(
  data: DataSeries[],
  smoothingWeight: number
): Promise<Array<{srcId: string; points: DataSeries['points']}>> {
  if (!data.length) {
    return [];
  }

  const results: Array<{srcId: string; points: DataSeries['points']}> = [];

  for (const series of data) {
    if (!series.points.length) {
      results.push({
        srcId: series.id,
        points: [],
      });
      continue;
    }

    let last = series.points.length > 0 ? 0 : NaN;
    let numAccum = 0;

    const initialYVal = series.points[0].y;
    const isConstant = series.points.every((point) => point.y == initialYVal);

    // See #786.
    if (isConstant) {
      // No need to prepend smoothed data.
      results.push({
        srcId: series.id,
        points: series.points,
      });
      continue;
    }

    const smoothedPoints = series.points.map((point) => {
      const nextVal = point.y;
      if (!Number.isFinite(nextVal)) {
        return {
          x: point.x,
          y: nextVal,
        };
      } else {
        last = last * smoothingWeight + (1 - smoothingWeight) * nextVal;
        numAccum++;
        // The uncorrected moving average is biased towards the initial value.
        // For example, if initialized with `0`, with smoothingWeight `s`, where
        // every data point is `c`, after `t` steps the moving average is
        // ```
        //   EMA = 0*s^(t) + c*(1 - s)*s^(t-1) + c*(1 - s)*s^(t-2) + ...
        //       = c*(1 - s^t)
        // ```
        // If initialized with `0`, dividing by (1 - s^t) is enough to debias
        // the moving average. We count the number of finite data points and
        // divide appropriately before storing the data.
        let debiasWeight = 1;
        if (smoothingWeight !== 1) {
          debiasWeight = 1 - Math.pow(smoothingWeight, numAccum);
        }
        return {
          x: point.x,
          y: last / debiasWeight,
        };
      }
    });
    results.push({
      srcId: series.id,
      points: smoothedPoints,
    });
  }

  return Promise.resolve(results);
}
