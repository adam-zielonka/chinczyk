import Node from './Node'

export default class UCT {
  public static uctValue(totalVisit: number, nodeWinScore: number, nodeVisit: number): number {
      if (nodeVisit === 0) { return Number.MAX_VALUE }
      return nodeWinScore / nodeVisit + 1.41 * Math.sqrt(Math.log(totalVisit) / nodeVisit)
  }

  public static findBestNodeWithUCT(node: Node): Node {
      const parentVisit = node.state.visitCount
      return node.childArray.reduce((a, b) => {
        return a.getUTC(parentVisit) > b.getUTC(parentVisit) ? a : b
      })
  }
}
