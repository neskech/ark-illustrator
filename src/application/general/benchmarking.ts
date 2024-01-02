/* eslint-disable @typescript-eslint/no-non-null-assertion */
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! MAIN TYPE DEFINITIONS AND GLOBAL DATA
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

import { reduce } from 'curve-interpolator';
import { requires } from '../drawingEditor/contracts';

const MAX_DATA_SIZE = 10e6;
const DATA_DELETE_PROPORTION = 0.1;
const COLORS = [
  '#7fdb98',
  '#db6986',
  '#f2977c',
  '#f5f062',
  '#7a62f5',
  '#c662f5',
  '#d0f562',
  '#7a80f0',
];

interface IncrementalLog {
  callDelay: number;
  callCount: number;
  type: 'incremental';
}

interface TimedLog {
  timeDelay: number;
  interval: NodeJS.Timeout | null;
  type: 'time';
}

interface LoggingOptions {
  logFrequency?: IncrementalLog | TimedLog;
  tenPercentLow?: boolean;
  tenPercentHigh?: boolean;
  median?: boolean;
}

interface Subject {
  name: string;
  data: number[];
  colorAssignment: number;
  loggingOptions: LoggingOptions;
}

type CombFn = (datapoints: number[]) => number;
interface CombinedSubject {
  name: string;
  targetSubjects: string[];
  colorAssignment: number;
  combinationFn: CombFn;
  loggingOptions: LoggingOptions;
}

export const incrementalLog = (callDelay: number): IncrementalLog => ({
  callDelay,
  callCount: 0,
  type: 'incremental',
});

export const timedLog = (timeDelay: number): TimedLog => ({
  timeDelay,
  interval: null,
  type: 'time',
});

export type TrackingOptions = {
  name: string;
  datapoint: number;
} & LoggingOptions;

export type CombinedTrackOptions = {
  targets: string[];
  combinationFn: CombFn;
} & Omit<TrackingOptions, 'datapoint'>;

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! EXPORTED FUNCTIONS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

export default class Benchmarker {
  private subjects: Map<string, Subject>;
  private combinedSubjects: Map<string, CombinedSubject>;
  private static instance: Benchmarker | null;

  constructor() {
    this.subjects = new Map();
    this.combinedSubjects = new Map();
  }

  private static getInstance(): Benchmarker {
    if (!this.instance) this.instance = new Benchmarker();
    return this.instance;
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! INTERFACE
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  static track(options: TrackingOptions) {
    const instance = this.getInstance();

    if (!instance.subjects.has(options.name))
      instance.subjects.set(
        options.name,
        instance.newSubject(
          options.name,
          options.logFrequency,
          options.tenPercentHigh,
          options.tenPercentHigh,
          options.median
        )
      );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const subject = instance.subjects.get(options.name)!;
    insert(subject, options.datapoint);

    const logFreq = subject.loggingOptions.logFrequency;
    if (logFreq && logFreq.type == 'incremental') {
      if (logFreq.callCount == logFreq.callDelay) this.printSubject(options.name);
      logFreq.callCount = (logFreq.callCount + 1) % (logFreq.callDelay + 1);
    }
  }

  static trackCombined(options: CombinedTrackOptions) {
    const instance = this.getInstance();

    requires(options.targets.length > 0);
    requires(options.targets.every((name) => instance.subjects.has(name)));

    if (!instance.combinedSubjects.has(options.name))
      instance.combinedSubjects.set(
        options.name,
        instance.newCombinedSubject(
          options.name,
          options.targets,
          options.combinationFn,
          options.logFrequency,
          options.tenPercentHigh,
          options.tenPercentHigh,
          options.median
        )
      );
  }

  static printSubject(name: string) {
    const instance = this.getInstance();

    requires(instance.subjects.has(name) || instance.combinedSubjects.has(name));

    const isNormal = instance.subjects.has(name);
    const subject = isNormal ? instance.subjects.get(name)! : instance.combinedSubjects.get(name)!;

    let data: number[];
    if (isNormal) data = instance.subjects.get(name)!.data;
    else data = instance.getDataFromCombinedSubject(subject as CombinedSubject);

    let s = `subject: ${name}\n`;
    s += `average: ${mean(data)}\n`;
    s += `standard deviation: ${standardDeviation(data)}\n`;

    if (subject.loggingOptions.median) s += `median: ${median(data)}\n`;
    if (subject.loggingOptions.tenPercentHigh) s += `ten percent high: ${tenPercentHigh(data)}\n`;
    if (subject.loggingOptions.tenPercentLow) s += `ten percent low: ${tenPercentLow(data)}\n`;

    s += `# data points: ${data.length}`;

    console.log(`%c${s}`, `color: ${COLORS[subject.colorAssignment]}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static trackRuntime<Args extends any[], Return, Fn extends (...args: Args) => Return>(
    f: Fn,
    options: Omit<TrackingOptions, 'datapoint'>
  ) {
    function replacement(...args: Args): Return {
      const before = new Date().getTime();
      const output = f(...args);
      const after = new Date().getTime();
      Benchmarker.track({
        datapoint: after - before,
        ...options,
      });
      return output;
    }

    return replacement;
  }

  static untrack(name: string) {
    const instance = this.getInstance();

    if (instance.subjects.has(name)) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const subject = instance.subjects.get(name)!;
      const logFreq = subject.loggingOptions.logFrequency;
      if (logFreq && logFreq.type == 'time' && logFreq.interval) clearInterval(logFreq.interval);

      instance.subjects.delete(name);
    }
  }

  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////
  //! INTERNALS
  ////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////

  newSubject(
    name: string,
    logFrequency?: IncrementalLog | TimedLog,
    tenPercentLow?: boolean,
    tenPercentHigh?: boolean,
    median?: boolean
  ): Subject {
    const subject: Subject = {
      name,
      data: [],
      colorAssignment: this.getNextFreeColor(),
      loggingOptions: {
        logFrequency,
        tenPercentHigh,
        tenPercentLow,
        median,
      },
    };

    const logFreq = subject.loggingOptions.logFrequency;
    if (logFreq && logFreq.type == 'time') {
      logFreq.interval = setInterval(
        () => Benchmarker.printSubject(name),
        logFreq.timeDelay * 1000
      );
    }

    return subject;
  }

  newCombinedSubject(
    name: string,
    targetSubjects: string[],
    combinationFn: CombFn,
    logFrequency?: IncrementalLog | TimedLog,
    tenPercentLow?: boolean,
    tenPercentHigh?: boolean,
    median?: boolean
  ): CombinedSubject {
    const subject: CombinedSubject = {
      name,
      targetSubjects,
      combinationFn,
      colorAssignment: this.getNextFreeColor(),
      loggingOptions: {
        logFrequency,
        tenPercentHigh,
        tenPercentLow,
        median,
      },
    };

    const logFreq = subject.loggingOptions.logFrequency;
    if (logFreq && logFreq.type == 'time') {
      logFreq.interval = setInterval(
        () => Benchmarker.printSubject(name),
        logFreq.timeDelay * 1000
      );
    }

    return subject;
  }

  getNextFreeColor(): number {
    const colorAssignments1 = Array.from(this.subjects.entries()).map((p) => p[1].colorAssignment);
    const colorAssignments2 = Array.from(this.combinedSubjects.entries()).map(
      (p) => p[1].colorAssignment
    );
    const colorAssignments = colorAssignments1.concat(colorAssignments2);

    colorAssignments.sort();

    for (let i = 0; i < colorAssignments.length - 1; i++) {
      const l = colorAssignments[i];
      const r = colorAssignments[i + 1];
      if (r > l + 1) return l + 1;
    }

    return 0;
  }

  getDataFromCombinedSubject(subject: CombinedSubject): number[] {
    const tracked = subject.targetSubjects;
    if (tracked.length == 0) return [];
    const combined = tracked.map((name) => this.subjects.get(name)!.data);
    const minLength = combined.map((c) => c.length).min();

    const data = Array.tabulate(minLength, (i) => {
      const comb: number[] = [];
      for (let j = 0; j < tracked.length; j++) comb.push(combined[j][i]);
      return subject.combinationFn(comb);
    });

    return data;
  }
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! STATISTICS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function mean(nums: number[]): number {
  if (nums.length == 0) return 0;

  return reduce(nums, (p, c) => p + c, 0) / nums.length;
}

function standardDeviation(nums: number[]): number {
  if (nums.length == 0) return 0;

  const m = mean(nums);

  let sum = 0;
  for (const n of nums) {
    const diff = n - m;
    sum += diff * diff;
  }

  return Math.sqrt(sum / (nums.length + 1));
}

function median(nums: number[]): number {
  if (nums.length % 2 == 0) return nums[nums.length / 2];

  const l = nums[nums.length / 2];
  const r = nums[nums.length / 2 + 1];
  return l + r;
}

function tenPercentLow(nums: number[]): number {
  const idx = Math.floor(nums.length * 0.1);
  return nums[idx];
}

function tenPercentHigh(nums: number[]): number {
  const idx = Math.floor(nums.length * 0.9);
  return nums[idx];
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
//! INTERNALS
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function insert(subject: Subject, dataPoint: number) {
  for (let i = 0; i < subject.data.length; i++) {
    if (dataPoint < subject.data[i]) {
      subject.data.splice(i, 0, dataPoint);
      return;
    }
  }

  subject.data.push(dataPoint);

  if (subject.data.length > MAX_DATA_SIZE)
    subject.data.splice(0, Math.floor(MAX_DATA_SIZE * DATA_DELETE_PROPORTION));
}
