import { vi, describe, it, expect } from 'vitest';
import Execution from '@/models/execution.js';
import ExecutionStep from '@/models/execution-step.js';
import Step from '@/models/step.js';
import Base from '@/models/base.js';
import Telemetry from '@/helpers/telemetry/index.js';
import { createExecution } from '@/factories/execution.js';
import { createExecutionStep } from '@/factories/execution-step.js';

describe('ExecutionStep model', () => {
  it('tableName should return correct name', () => {
    expect(ExecutionStep.tableName).toBe('execution_steps');
  });

  it('jsonSchema should have correct validations', () => {
    expect(ExecutionStep.jsonSchema).toMatchSnapshot();
  });

  it('relationMappings should return correct associations', () => {
    const relationMappings = ExecutionStep.relationMappings();

    const expectedRelations = {
      execution: {
        relation: Base.BelongsToOneRelation,
        modelClass: Execution,
        join: {
          from: 'execution_steps.execution_id',
          to: 'executions.id',
        },
      },
      step: {
        relation: Base.BelongsToOneRelation,
        modelClass: Step,
        join: {
          from: 'execution_steps.step_id',
          to: 'steps.id',
        },
      },
    };

    expect(relationMappings).toStrictEqual(expectedRelations);
  });

  describe('isFailed', () => {
    it('should return true if status is failure', async () => {
      const executionStep = new ExecutionStep();
      executionStep.status = 'failure';

      expect(executionStep.isFailed).toBe(true);
    });

    it('should return false if status is not failure', async () => {
      const executionStep = new ExecutionStep();
      executionStep.status = 'success';

      expect(executionStep.isFailed).toBe(false);
    });
  });

  describe('$afterInsert', () => {
    it('should call Telemetry.executionStepCreated', async () => {
      const telemetryExecutionStepCreatedSpy = vi
        .spyOn(Telemetry, 'executionStepCreated')
        .mockImplementation(() => {});

      const executionStep = await createExecutionStep();

      expect(telemetryExecutionStepCreatedSpy).toHaveBeenCalledWith(
        executionStep
      );
    });
  });

  describe('updateExecutionStatus', () => {
    it('should update execution status to failure when step status is failure', async () => {
      const execution = await createExecution();
      const executionStep = await createExecutionStep({
        executionId: execution.id,
        status: 'failure',
      });

      await executionStep.updateExecutionStatus();

      const updatedExecution = await execution.$query();
      expect(updatedExecution.status).toBe('failure');
    });

    it('should update execution status to success when step status is success', async () => {
      const execution = await createExecution();
      const executionStep = await createExecutionStep({
        executionId: execution.id,
        status: 'success',
      });

      await executionStep.updateExecutionStatus();

      const updatedExecution = await execution.$query();
      expect(updatedExecution.status).toBe('success');
    });
  });
});
