import Base from '@/models/base.js';
import Execution from '@/models/execution.js';
import Step from '@/models/step.js';
import Telemetry from '@/helpers/telemetry/index.js';

class ExecutionStep extends Base {
  static tableName = 'execution_steps';

  static jsonSchema = {
    type: 'object',

    properties: {
      id: { type: 'string', format: 'uuid' },
      executionId: { type: 'string', format: 'uuid' },
      stepId: { type: 'string' },
      dataIn: { type: ['object', 'null'] },
      dataOut: { type: ['object', 'null'] },
      status: { type: 'string', enum: ['success', 'failure'] },
      errorDetails: { type: ['object', 'null'] },
      deletedAt: { type: 'string' },
      createdAt: { type: 'string' },
      updatedAt: { type: 'string' },
    },
  };

  static relationMappings = () => ({
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
  });

  get isFailed() {
    return this.status === 'failure';
  }

  async updateExecutionStatus() {
    const execution = await this.$relatedQuery('execution');

    await execution.$query().patch({
      status: this.status === 'failure' ? 'failure' : 'success',
    });
  }

  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext);
    Telemetry.executionStepCreated(this);
    await this.updateExecutionStatus();
  }
}

export default ExecutionStep;
