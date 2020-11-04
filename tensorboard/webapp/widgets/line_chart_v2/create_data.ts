import {DataSeries} from './lib/types';

const NUM_POINTS = 1000;
const NUM_PERIODS = 3;

export function createDataSeries(
  numSeries: number,
  numPointsPerSeries = NUM_POINTS
): DataSeries[] {
  return [...new Array(Math.round(numSeries))].map((_, index) => {
    return createData(numPointsPerSeries, index * 2 + 1);
  });
}

function createData(numPointsPerSeries: number, lambda: number): DataSeries {
  return {
    id: `sine_${lambda}`,
    points: [...new Array(numPointsPerSeries)].map((_, index) => {
      return {
        x: index,
        y:
          Math.sin(
            (lambda * index * 2 * Math.PI * NUM_PERIODS) / numPointsPerSeries
          ) / lambda,
      };
    }),
  };
}
