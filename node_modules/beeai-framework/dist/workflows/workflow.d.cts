import { Run } from '../context.cjs';
import { ZodSchema, z } from 'zod';
import { Serializable } from '../internals/serializable.cjs';
import { E as Emitter, C as Callback } from '../emitter-D5Mu0EEH.cjs';
import { FrameworkError } from '../errors.cjs';
import '../internals/helpers/promise.cjs';
import '../internals/types.cjs';
import '../internals/helpers/guards.cjs';

type WorkflowStepHandlerReturn<K extends string> = K | ReservedStep | void;
interface WorkflowRun<T extends ZodSchema, T2 extends ZodSchema, K extends string> {
    result: z.output<T2>;
    steps: WorkflowStepRes<T, K>[];
    state: z.output<T>;
}
interface WorkflowRunOptions<K extends string> {
    start?: K;
    signal?: AbortSignal;
}
interface WorkflowStepDef<T extends ZodSchema, K extends string> {
    schema: T;
    handler: WorkflowStepHandler<T, K>;
}
interface WorkflowStepRes<T extends ZodSchema, K extends string> {
    name: K;
    next: K | ReservedStep;
    state: z.output<T>;
}
interface WorkflowRunContext<T extends ZodSchema, K extends string> {
    steps: WorkflowStepRes<T, K>[];
    signal: AbortSignal;
    abort: (reason?: Error) => void;
}
type WorkflowStepHandler<T extends ZodSchema, K extends string> = (state: z.output<T>, context: WorkflowRunContext<T, K>) => Promise<WorkflowStepHandlerReturn<K>> | WorkflowStepHandlerReturn<K>;
interface WorkflowEvents<T extends ZodSchema, T2 extends ZodSchema, K extends string> {
    start: Callback<{
        step: K;
        run: WorkflowRun<T, T2, K>;
    }>;
    error: Callback<{
        step: K;
        error: Error;
        run: WorkflowRun<T, T2, K>;
    }>;
    success: Callback<{
        step: K;
        next: K | ReservedStep;
        state: z.output<T>;
        run: WorkflowRun<T, T2, K>;
    }>;
}
interface FlowInput<TS extends ZodSchema, TS2 extends ZodSchema = TS> {
    name?: string;
    schema: TS;
    outputSchema?: TS2;
}
type ReservedStep = typeof Workflow.START | typeof Workflow.NEXT | typeof Workflow.PREV | typeof Workflow.END | typeof Workflow.SELF;
type FlowStepName<K extends string> = K | ReservedStep;
declare class WorkflowError<T extends ZodSchema, T2 extends ZodSchema, K extends string> extends FrameworkError {
    constructor(message: string, extra?: {
        run?: WorkflowRun<T, T2, K>;
        errors?: Error[];
    });
}
declare class Workflow<TInput extends ZodSchema, TOutput extends ZodSchema = TInput, TKeys extends string = string> extends Serializable {
    protected readonly input: FlowInput<TInput, TOutput>;
    static readonly START = "__start__";
    static readonly SELF = "__self__";
    static readonly PREV = "__prev__";
    static readonly NEXT = "__next__";
    static readonly END = "__end__";
    readonly emitter: Emitter<WorkflowEvents<TInput, TOutput, TKeys>>;
    protected readonly steps: Map<string, WorkflowStepDef<TInput, TKeys>>;
    protected startStep: TKeys | undefined;
    constructor(input: FlowInput<TInput, TOutput>);
    getSteps(): TKeys[];
    get name(): string;
    get schemas(): {
        schema: TInput;
        outputSchema?: TOutput | undefined;
    };
    addStep<L extends string>(name: L, handler: WorkflowStepHandler<TInput | TOutput, TKeys>): Workflow<TInput, TOutput, L | TKeys>;
    addStep<L extends string, TFlow extends AnyWorkflowFlow>(name: L, flow: Workflow.pipeable<this, TFlow>): Workflow<TInput, TOutput, L | TKeys>;
    addStrictStep<L extends string, TI2 extends ZodSchema>(name: L, schema: TI2, handler: WorkflowStepHandler<TI2, TKeys>): Workflow<TInput, TOutput, L | TKeys>;
    addStrictStep<L extends string, TI2 extends ZodSchema, TFlow extends AnyWorkflowFlow>(name: L, schema: TI2, flow: Workflow.pipeable<Workflow<TI2, TOutput, TKeys>, TFlow>): Workflow<TInput, TOutput, L | TKeys>;
    protected _addStep<TI2 extends ZodSchema = TInput, L extends string = TKeys>(name: L, schemaOrStep: TI2 | WorkflowStepHandler<TInput, TKeys> | AnyWorkflowFlow, stepOrEmpty?: WorkflowStepHandler<TI2, TKeys> | AnyWorkflowFlow): Workflow<TInput, TOutput, L | TKeys>;
    setStart(name: TKeys): this;
    run(state: z.input<TInput>, options?: WorkflowRunOptions<TKeys>): Run<WorkflowRun<TInput, TOutput, TKeys>, this, readonly [z.input<TInput>, WorkflowRunOptions<TKeys>]>;
    delStep<L extends TKeys>(name: L): Workflow<TInput, TOutput, Exclude<TKeys, L>>;
    asStep<TInput2 extends ZodSchema = TInput, TOutput2 extends ZodSchema = TOutput, TKeys2 extends string = TKeys>(overrides: {
        input?: (input: z.output<TInput2>) => z.output<TInput> | z.input<TInput>;
        output?: (output: z.output<TOutput>) => z.output<TOutput2> | z.input<TOutput2>;
        start?: TKeys;
        next?: FlowStepName<TKeys2>;
    }): WorkflowStepHandler<TInput2, TKeys | TKeys2>;
    protected findStep(current: TKeys): {
        prev: TKeys;
        current: TKeys;
        next: TKeys;
    };
    createSnapshot(): {
        input: Omit<FlowInput<TInput, TOutput>, "schema" | "outputSchema">;
        emitter: Emitter<WorkflowEvents<TInput, TOutput, TKeys>>;
        startStep: TKeys | undefined;
        steps: Map<string, WorkflowStepDef<TInput, TKeys>>;
    };
    loadSnapshot(snapshot: ReturnType<typeof this.createSnapshot>): void;
}
declare namespace Workflow {
    type pipeable<T extends AnyWorkflowFlow, T2 extends AnyWorkflowFlow> = Workflow.state<T> extends Workflow.input<T2> ? T2 : never;
    type input<T> = T extends Workflow<infer A, any, any> ? z.input<A> : never;
    type state<T> = T extends Workflow<infer A, any, any> ? z.output<A> : never;
    type output<T> = T extends Workflow<any, infer A, any> ? z.output<A> : never;
    type run<T> = T extends Workflow<infer A, infer B, infer C> ? WorkflowRun<A, B, C> : never;
}
type AnyWorkflowFlow = Workflow<any, any, any>;

export { type AnyWorkflowFlow, type FlowStepName, Workflow, WorkflowError, type WorkflowEvents, type WorkflowRun, type WorkflowRunContext, type WorkflowRunOptions, type WorkflowStepDef, type WorkflowStepHandler, type WorkflowStepRes };
