import config from '../../config';
import { Express, Request, Response } from 'express';
import channelsApi from './channels.api';

class ChannelsRoutes {
  constructor() { }

  public initRoutes(app: Express) {
    app
      .get(config.MEMPOOL.API_URL_PREFIX + 'channels/:short_id', this.$getChannel)
      .get(config.MEMPOOL.API_URL_PREFIX + 'channels', this.$getChannels)
    ;
  }

  private async $getChannel(req: Request, res: Response) {
    try {
      const channel = await channelsApi.$getChannel(req.params.short_id);
      if (!channel) {
        res.status(404).send('Channel not found');
        return;
      }
      res.json(channel);
    } catch (e) {
      res.status(500).send(e instanceof Error ? e.message : e);
    }
  }

  private async $getChannels(req: Request, res: Response) {
    try {
      if (typeof req.query.public_key !== 'string') {
        res.status(501).send('Missing parameter: public_key');
        return;
      }
        const channels = await channelsApi.$getChannelsForNode(req.query.public_key);
        res.json(channels);
    } catch (e) {
      res.status(500).send(e instanceof Error ? e.message : e);
    }
  }

}

export default new ChannelsRoutes();
