import config from '../../config';
import { Express, Request, Response } from 'express';
import nodesApi from './nodes.api';
class NodesRoutes {
  constructor(app: Express) {
    app
      .get(config.MEMPOOL.API_URL_PREFIX + 'statistics/latest', this.$getGeneralStats)
      .get(config.MEMPOOL.API_URL_PREFIX + 'nodes/top', this.$getTopNodes)
    ;
  }

  private async $getGeneralStats(req: Request, res: Response) {
    try {
      const statistics = await nodesApi.$getLatestStatistics();
      res.json(statistics);
    } catch (e) {
      res.status(500).send(e instanceof Error ? e.message : e);
    }
  }

  private async $getTopNodes(req: Request, res: Response) {
    try {
      const topCapacityNodes = await nodesApi.$getTopCapacityNodes();
      const topChannelsNodes = await nodesApi.$getTopChannelsNodes();
      res.json({
        topByCapacity: topCapacityNodes,
        topByChannels: topChannelsNodes,
      });
    } catch (e) {
      res.status(500).send(e instanceof Error ? e.message : e);
    }
  }
}

export default NodesRoutes;
