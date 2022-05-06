
import DB from '../database';
import logger from '../logger';
import lightningApi from '../api/lightning-api-factory';
import { ILightningApi } from '../api/lightning-api.interface';

class NodeSyncService {
  constructor() {}

  public async startService() {
    logger.info('Starting node sync service');

    this.$updateNodes();

    setInterval(async () => {
      await this.$updateNodes();
    }, 1000 * 60 * 60);
  }

  private async $updateNodes() {
    try {
      const networkGraph = await lightningApi.$getNetworkGraph();

      for (const node of networkGraph.nodes) {
        await this.$saveNode(node);
      }

      for (const channel of networkGraph.channels) {
        await this.$saveChannel(channel);
      }
    } catch (e) {
      logger.err('$updateNodes() error: ' + (e instanceof Error ? e.message : e));
    }
  }

  private async $saveChannel(channel: ILightningApi.Channel) {
    try {
      const d = new Date(Date.parse(channel.updated_at));
      const query = `INSERT INTO channels
        (
          id,
          capacity,
          transaction_id,
          transaction_vout,
          updated_at,
          node1_public_key,
          node1_base_fee_mtokens,
          node1_cltv_delta,
          node1_fee_rate,
          node1_is_disabled,
          node1_max_htlc_mtokens,
          node1_min_htlc_mtokens,
          node1_updated_at,
          node2_public_key,
          node2_base_fee_mtokens,
          node2_cltv_delta,
          node2_fee_rate,
          node2_is_disabled,
          node2_max_htlc_mtokens,
          node2_min_htlc_mtokens,
          node2_updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          capacity = ?,
          updated_at = ?,
          node1_public_key = ?,
          node1_base_fee_mtokens = ?,
          node1_cltv_delta = ?,
          node1_fee_rate = ?,
          node1_is_disabled = ?,
          node1_max_htlc_mtokens = ?,
          node1_min_htlc_mtokens = ?,
          node1_updated_at = ?,
          node2_public_key = ?,
          node2_base_fee_mtokens = ?,
          node2_cltv_delta = ?,
          node2_fee_rate = ?,
          node2_is_disabled = ?,
          node2_max_htlc_mtokens = ?,
          node2_min_htlc_mtokens = ?,
          node2_updated_at = ?
        ;`;

      await DB.query(query, [
        channel.id,
        channel.capacity,
        channel.transaction_id,
        channel.transaction_vout,
        channel.updated_at ? this.utcDateToMysql(channel.updated_at) : 0,
        channel.policies[0].public_key,
        channel.policies[0].base_fee_mtokens,
        channel.policies[0].cltv_delta,
        channel.policies[0].fee_rate,
        channel.policies[0].is_disabled,
        channel.policies[0].max_htlc_mtokens,
        channel.policies[0].min_htlc_mtokens,
        channel.policies[0].updated_at ? this.utcDateToMysql(channel.policies[0].updated_at) : 0,
        channel.policies[1].public_key,
        channel.policies[1].base_fee_mtokens,
        channel.policies[1].cltv_delta,
        channel.policies[1].fee_rate,
        channel.policies[1].is_disabled,
        channel.policies[1].max_htlc_mtokens,
        channel.policies[1].min_htlc_mtokens,
        channel.policies[1].updated_at ? this.utcDateToMysql(channel.policies[1].updated_at) : 0,
        channel.capacity,
        channel.updated_at ? this.utcDateToMysql(channel.updated_at) : 0,
        channel.policies[0].public_key,
        channel.policies[0].base_fee_mtokens,
        channel.policies[0].cltv_delta,
        channel.policies[0].fee_rate,
        channel.policies[0].is_disabled,
        channel.policies[0].max_htlc_mtokens,
        channel.policies[0].min_htlc_mtokens,
        channel.policies[0].updated_at ? this.utcDateToMysql(channel.policies[0].updated_at) : 0,
        channel.policies[1].public_key,
        channel.policies[1].base_fee_mtokens,
        channel.policies[1].cltv_delta,
        channel.policies[1].fee_rate,
        channel.policies[1].is_disabled,
        channel.policies[1].max_htlc_mtokens,
        channel.policies[1].min_htlc_mtokens,
        channel.policies[1].updated_at ? this.utcDateToMysql(channel.policies[1].updated_at) : 0,
      ]);
    } catch (e) {
      logger.err('$saveChannel() error: ' + (e instanceof Error ? e.message : e));
    }
  }

  private async $saveNode(node: ILightningApi.Node) {
    try {
      const updatedAt = this.utcDateToMysql(node.updated_at);
      const query = `INSERT INTO nodes(
          public_key,
          first_seen,
          updated_at,
          alias,
          color
        )
        VALUES (?, NOW(), ?, ?, ?) ON DUPLICATE KEY UPDATE updated_at = ?, alias = ?, color = ?;`;

      await DB.query(query, [
        node.public_key,
        updatedAt,
        node.alias,
        node.color,
        updatedAt,
        node.alias,
        node.color,
      ]);
    } catch (e) {
      logger.err('$saveNode() error: ' + (e instanceof Error ? e.message : e));
    }
  }

  private utcDateToMysql(dateString: string): string {
    const d = new Date(Date.parse(dateString));
    return d.toISOString().split('T')[0] + ' ' + d.toTimeString().split(' ')[0];
  }
}

export default new NodeSyncService();
