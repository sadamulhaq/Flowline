import { vi, expect, describe, it } from 'vitest';
import request from 'supertest';
import appConfig from '@/config/app.js';
import Config from '@/models/config.js';
import app from '../../../../../app.js';
import infoMock from '@/mocks/rest/internal/api/v1/flowline/info.js';

describe('GET /internal/api/v1/flowline/info', () => {
  it('should return Flowline info', async () => {
    vi.spyOn(Config, 'isInstallationCompleted').mockResolvedValue(true);
    vi.spyOn(appConfig, 'isMation', 'get').mockReturnValue(false);
    vi.spyOn(appConfig, 'docsUrl', 'get').mockReturnValue(
      'https://automatisch.io/docs'
    );

    const response = await request(app)
      .get('/internal/api/v1/flowline/info')
      .expect(200);

    const expectedPayload = infoMock();

    expect(response.body).toStrictEqual(expectedPayload);
  });
});
