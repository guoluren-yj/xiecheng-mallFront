/**
 * FlowChart
 * 流程图表格
 * @date: 2021-09-08
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { useEffect, useRef, useCallback, useState } from 'react';
import G6 from '@antv/g6';
import { Spin, Modal } from 'choerodon-ui/pro';
import { debounce } from 'lodash';

import { getResponse, getPrimaryColor } from 'utils/utils';
// import { openTab } from 'utils/menuTab';
// import notification from 'utils/notification';
import intl from 'utils/intl';

import { queryAllNodes, queryNodesAuthority } from './docFlowService';
import DocInfo from './DocInfo';

// icon图片
import SOURCE_RFP from '../../assets/images/docFlow/SOURCE_RFP.svg';
import SOURCE_RFI from '../../assets/images/docFlow/SOURCE_RFI.svg';
import RECEIVE from '../../assets/images/docFlow/RECEIVE.svg';
import ASN from '../../assets/images/docFlow/ASN.svg';
import SSTA_SETTLE from '../../assets/images/docFlow/SSTA_SETTLE.svg';
import SSTA_PAYMENT from '../../assets/images/docFlow/SSTA_PAYMENT.svg';
import SSTA_INVOICE from '../../assets/images/docFlow/SSTA_INVOICE.svg';
import SSTA_BILL from '../../assets/images/docFlow/SSTA_BILL.svg';
import SSTA_CHARGE from '../../assets/images/docFlow/SSTA_CHARGE.svg';
import PR from '../../assets/images/docFlow/PR.svg';
import PO from '../../assets/images/docFlow/PO.svg';
import SOURCE_SUBJECT from '../../assets/images/docFlow/SOURCE_SUBJECT.svg';
import SOURCE_RFX from '../../assets/images/docFlow/SOURCE_RFX.svg';
import SOURCE_BID from '../../assets/images/docFlow/SOURCE_BID.svg';
import PC_SUBJECT from '../../assets/images/docFlow/PC_SUBJECT.svg';
import ECPO from '../../assets/images/docFlow/ECPO.svg';
import ECPR from '../../assets/images/docFlow/ECPR.svg';
import docFlowExplainImg from '../../assets/images/docFlow/docFlowExplainImg.svg';

// FlowChart interface
interface FlowChartProps {
  tableName: string;
  tablePk: string;
  currentOrganizationId: number;
  currentUserId: number;
}

// AuthorityListNode 节点权限 interface
interface AuthorityListNode {
  allocated: boolean;
  authorityCode: string;
  authorityType: string;
  expand: boolean;
  name: string;
  nodeDefinitionCode: string;
}

// color
const colorMap = {
  VIRTUAL: '#D7D7D7',
  PROCESS: '#FF9500',
  FINISHED: '#00B377',
  CANCELED: '#999999',
};

// imgMap
const imgMap = {
  SOURCE_RFP,
  SOURCE_RFI,
  RECEIVE,
  ASN,
  SSTA_SETTLE,
  SSTA_PAYMENT,
  SSTA_INVOICE,
  SSTA_BILL,
  SSTA_CHARGE,
  PR,
  PO,
  SOURCE_SUBJECT,
  SOURCE_RFX,
  SOURCE_BID,
  PC_SUBJECT,
  ECPO,
  ECPR,
  SOURCE_NEW_BID: SOURCE_BID,
  SLOD_ASN: ASN,
  SLOD_PLAN: ASN,
  SLOD_LABEL: ASN,

};

function FlowChart(props: FlowChartProps) {
  const { tableName, tablePk, currentOrganizationId, currentUserId } = props;
  const [docChartLoading, handleDocChartLoading] = useState(true);
  const ref = useRef(null);
  const nodesAuthority = useRef([]); // 保存权限数组数据
  let flowGraph: any = null;

  // 多语言 Map
  const PromptMap = {
    PROGRESS: intl.get('component.docFlow.view.nodeTooltip.title.progress').d('执行进度'),
    FINISHED: intl.get('hzero.common.status.success').d('成功'),
    PROCESS: intl.get('component.docFlow.view.nodeTooltip.process').d('执行中'),
    SSTA_SETTLE_STATUS: intl
      .get('component.docFlow.view.nodeTooltip.sstaSettleStatus')
      .d('结算状态'),
    ECPO_FORMPO: intl.get('component.docFlow.view.nodeTooltip.orderSyncSuccess').d('订单同步成功'),
    EXCEPTION_STATUS: intl.get('component.docFlow.view.nodeTooltip.exceptionStatus').d('异常'),
    LEGEND_COLOR_FINISH: intl.get('component.docFlow.view.legend.color.finish').d('已完成'),
    LEGEND_COLOR_PROCESS: intl.get('component.docFlow.view.legend.color.process').d('进行中'),
    LEGEND_COLOR_VIRTUAL: intl.get('component.docFlow.view.legend.color.virtual').d('待执行'),
    LEGEND_COLOR_CANCELED: intl.get('component.docFlow.view.legend.color.cancel').d('已取消'),
    LEGEND_EXPLAIN_TITLE: intl.get('component.docFlow.view.explain.title').d('快捷缩放'),
    LEGEND_EXPLAIN_DESC: intl
      .get('component.docFlow.view.explain.description')
      .d('按住键盘Ctrl+鼠标滚轮滚动，也可以进行缩放。'),
    LEGEND_EXPLAIN_BTN_NO_REMINDER: intl
      .get('component.docFlow.view.explain.button.noReminder')
      .d('不再提示'),
    LEGEND_EXPLAIN_BTN_NEXT_REMINDER: intl
      .get('component.docFlow.view.explain.button.nextReminder')
      .d('知道啦'),
  };

  /**
   * 初始化节点位置计算
   * 当前节点是商城订单/商城申请/采购申请，则靠左显示；
   * 当前节点是结算的单据（结算池、对账单、发票、付款单），则靠右显示；
   * 当前节点是其他单据，则居中显示；
   * @param {Object} treeData 树形数据
   * @returns x 横坐标位置 y 纵坐标位置
   */
  const getPosition = (treeData) => {
    const x = 530;
    const y = 300;
    let xNum = 0;
    let yNum = 0;
    let currentNodeType = '';
    const getXY = (nodes) => {
      xNum++;
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeCoordinateFlag === 1) {
          currentNodeType = nodes[i].nodeDefinitionCode;
          yNum = i;
          return;
        } else {
          getXY(nodes[i].children);
        }
      }
    };
    getXY(treeData);
    switch (currentNodeType) {
      case 'PR':
      case 'ECPR':
      case 'ECPO':
        return {
          x: 200,
          y: 180,
        };
      case 'SSTA_INVOICE':
      case 'SSTA_BILL':
      case 'SSTA_SETTLE':
      case 'SSTA_PAYMENT':
      case 'SSTA_CHARGE':
        return {
          x: x - (xNum - 1) * 240 + 400,
          y: y - yNum * 60,
        };
      default:
        return {
          x: x - (xNum - 1) * 240,
          y: y - yNum * 60,
        };
    }
  };

  /**
   * 给图标数据中百分比变化 input 添加 blur 监听时间
   * @param {Object} graph 当前图数据
   */
  const addPercentDomBlurListener = (graph) => {
    const percentDom = document.getElementById('docFlow-g6-component-toolbar-docFlow-percent') || document.createElement('input');
    percentDom.addEventListener('blur', (e) => {
      const num = parseInt((e.target as HTMLInputElement).value, 10);
      let percent = 100;
      if (num > 300) {
        percent = 300;
      } else if (num < 50) {
        percent = 50;
      } else {
        percent = num;
      }
      (percentDom as HTMLInputElement).value = percent.toString();
      graph.zoomTo(percent / 100);
    });
  };

  // 图例
  const legendToolBar = new G6.ToolBar({
    position: { x: 1040, y: 650 },
    className: 'docFlow-g6-component-toolbar-legend',
    getContent: () => {
      return `
        <ul class="docFlow-g6-component-toolbar-legend">
          <li>
            <span class='legend-color-circular' style='background-color: ${colorMap.VIRTUAL}'></span>
            <span>${PromptMap.LEGEND_COLOR_VIRTUAL}</span>
          </li>
          <li>
            <span class='legend-color-circular' style='background-color: ${colorMap.CANCELED}'></span>
            <span>${PromptMap.LEGEND_COLOR_CANCELED}</span>
          </li>
          <li>
            <span class='legend-color-circular' style='background-color: ${colorMap.PROCESS}'></span>
            <span>${PromptMap.LEGEND_COLOR_PROCESS}</span>
          </li>
          <li>
            <span class='legend-color-circular' style='background-color: ${colorMap.FINISHED}'></span>
            <span>${PromptMap.LEGEND_COLOR_FINISH}</span>
          </li>
        </ul>
      `;
    },
  });

  // 图例放大缩小提示
  const explainToolbar = new G6.ToolBar({
    position: { x: 886, y: 136 },
    className: 'g6-component-toolbar docFlow-g6-component-toolbar-docFlow-explain',
    getContent: () => {
      // 判断 localStorage 中是否存在 hideDocFlowExplainFlag
      const hideDocFlowExplainFlag = localStorage.getItem('hideDocFlowExplainFlag');
      return hideDocFlowExplainFlag ? `<div style='display: none' />` : `
        <div style='width: 240px; height: 248px; padding: 10px' id='docFlow-g6-component-toolbar-docFlow-explain'>
          <div>
            <img style='width: 218px; height: 100px' draggable="false" src="${docFlowExplainImg}" alt="" />
          </div>
          <div style='width: 218px; padding: 0 5px'>
            <span style='color: #191919; display: block; margin: 15px 0 5px 0; font-size: 14px; font-weight: 500;'>${PromptMap.LEGEND_EXPLAIN_TITLE}</span>
            <span style='color: #666666; font-weight: 400;'>${PromptMap.LEGEND_EXPLAIN_DESC}</span>
          </div>
          <ul style="width: 100%; margin: 15px auto 5px;display: flex;align-items: center;justify-content: right;">
            <li code='no-reminder' class='no-reminder' style="color:#999999; width: unset; maxWidth: 140px; height: 14px">${PromptMap.LEGEND_EXPLAIN_BTN_NO_REMINDER}</li>
            <li code='next-reminder' title='${PromptMap.LEGEND_EXPLAIN_BTN_NEXT_REMINDER}' class='text-overflow' style="width: 56px;height: 24px;text-align: center;background: ${getPrimaryColor()};padding: 4px 10px;color: #fff;border-radius: 2px;margin-left: 16px;font-weight: 600;">${PromptMap.LEGEND_EXPLAIN_BTN_NEXT_REMINDER}</li>
          </ul>
        </div>
      `;
    },
    handleClick: (code) => {
      if (code === 'no-reminder') {
        // localStorage 中设置 hideDocFlowExplainFlag
        localStorage.setItem('hideDocFlowExplainFlag', 'true');
      }
      // dom操作删除节点，ts绕过给创建一个div
      const explainDom = document.getElementById('docFlow-g6-component-toolbar-docFlow-explain') || document.createElement('div');
      if (explainDom as HTMLElement) {
        explainDom.style.display = 'none';
      }
    },
  });

  // 缩放工具
  const zoomToolbar = new G6.ToolBar({
    position: { x: 1000, y: 80 },
    className: 'g6-component-toolbar docFlow-g6-component-toolbar-docFlow-zoomToolbar',
    getContent: () => {
      return `
        <ul class="g6-component-toolbar">
          <li code="zoomIn">
            <svg class="icon" width="20px" height="20px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path fill="#191919" d="M872 474H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h720c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" />
            </svg>
          </li>
          <li class='zoom-percent'>
            <input type="number" max="300" min="50" value="100" class="zoom-input" style='height: 24px; line-height: 24px' id='docFlow-g6-component-toolbar-docFlow-percent'>%</input>
          </li>
          <li code="zoomOut">
            <svg class="icon" width="20px" height="20px" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path fill="#191919" d="M853.333333 480H544V170.666667c0-17.066667-14.933333-32-32-32s-32 14.933333-32 32v309.333333H170.666667c-17.066667 0-32 14.933333-32 32s14.933333 32 32 32h309.333333V853.333333c0 17.066667 14.933333 32 32 32s32-14.933333 32-32V544H853.333333c17.066667 0 32-14.933333 32-32s-14.933333-32-32-32z" />
            </svg>
          </li>
        </ul>
      `;
    },
    handleClick: (code, graph) => {
      const percentDom = document.getElementById('docFlow-g6-component-toolbar-docFlow-percent') as HTMLInputElement;
      const currentNum = parseInt(percentDom.value, 10) || 100;
      if (code === 'zoomIn' && percentDom) {
        if (currentNum >= 60) {
          percentDom.value = `${currentNum - 10}`;
          graph.zoomTo((graph.getZoom() - 0.1));
        } else {
          percentDom.value = '50';
          graph.zoomTo(0.5);
        }
      } else if (code === 'zoomOut') {
        if (currentNum <= 290) {
          percentDom.value = `${currentNum + 10}`;
          graph.zoomTo(graph.getZoom() + 0.1);
        } else {
          percentDom.value = '300';
          graph.zoomTo(3);
        }
      }
    },
  });

  // Edge 连接线上 tooltip 弹框
  const tooltipEdge = new G6.Tooltip({
    offsetX: 0,
    offsetY: 0,
    fixToNode: [1, 0],
    itemTypes: ['edge'],
    shouldBegin: (e: any) => {
      return !!e?.item?.getTarget()?.getModel()?.nodeDataCnfRecord;
    },
    getContent: (e: any) => {
      const edge = e.item;
      const progressInfo = edge?.getTarget()?.getModel() || {};
      const outDiv = document.createElement('div');
      outDiv.style.width = 'fit-content';
      outDiv.style.color = '#FFF';
      outDiv.innerHTML = `
        <h4 style='color: #FFF'>${PromptMap.PROGRESS}: <span style='background-color: ${
        progressInfo?.nodeDataCnfRecord?.status ? colorMap.FINISHED : colorMap.PROCESS
        }'>${
        progressInfo?.nodeDataCnfRecord?.status ? PromptMap.FINISHED : PromptMap.PROCESS
        }</span></h4>
        ${(progressInfo?.fromPoEcpoFlag?`<h4 style='color: #FFF'>${PromptMap.ECPO_FORMPO}</h4>`:`<span />`)}
        <ul style='padding: 0'>${(progressInfo?.nodeDataCnfRecord?.nodeCnfName || [])
          .map(info => {
            return `<span style='display: block; padding: 4px 0 0 0;'><span style='display: inline-block; width: 4px;height: 4px; border-radius: 4px; background: ${
              info.status === 'FINISHED' ? colorMap.FINISHED : colorMap.VIRTUAL
              };'></span>${info.cnfName}</span>`;
          })
          .join('')}</ul>`;
      return outDiv;
    },
  });

  // node 节点上 tooltip 弹框
  const tooltipNode = new G6.Tooltip({
    offsetX: 0,
    offsetY: 0,
    fixToNode: [1, 0],
    itemTypes: ['node'],
    shouldBegin: (e) => {
      return e?.item?.getModel()?.nodeDefinitionCode === 'SSTA_SETTLE' && ['current-node-box', 'main-box', 'img-box'].includes(e?.target?.cfg?.name) || e?.target?.cfg?.name === 'node-title';
    },
    getContent: (e: any) => {
      const node = e.item;
      const outDiv = document.createElement('div');
      outDiv.style.width = 'fit-content';
      outDiv.style.color = '#FFF';
      // 判断是 node-title 或者 元素节点 被hover
      if (e?.target?.cfg?.name === 'node-title') {
        const nodeTitle = node?.getModel() || {};
        const { name, status, quantity, unit } = nodeTitle;
        outDiv.innerHTML = `
          <div style='font-size: 12px'>
            ${name}${
          status !== 'VIRTUAL'
            ? `，${quantity === null ? 0 : quantity}${unit === null ? '' : unit}`
            : ''
          }
          </div>
        `;
      } else {
        const nodeStatusList = node?.getModel()?.sstaSettleStatus || [];
        outDiv.innerHTML = `
          <h4 style='color: #FFF'>${PromptMap.SSTA_SETTLE_STATUS}</h4>
          <ul style='padding: 0'>${nodeStatusList
            .map(list => {
              return `<span style='display: block; padding: 4px 0 0 0;'><span style='display: inline-block; width: 4px;height: 4px; border-radius: 4px; background: ${
                colorMap[list.status]
                };'></span>${list.statusName}: ${list.statusDescription}</span>`;
            })
            .join('')}</ul>`;
      }

      return outDiv;
    },
  });


  /**
   * 初始化元素
   */
  const initChartElement = () => {
    // 注册 node 节点
    G6.registerNode('card-node', {
      draw: function drawShape(cfg: any, group: any) {
        const { name: nodeName, docNum, status, size = [], quantity, unit, nodeDefinitionCode, isCurrentNode, isReadOnly } = cfg;
        const { allAuthorityFlag } = getModalOpenAuthorityMap(nodeDefinitionCode);
        const color = colorMap[status];
        const w = size[0];
        const h = size[1];
        const shape = group.addShape('circle', {
          attrs: {
            x: 0,
            y: -h + 40,
            r: w / 3.4,
            stroke: isCurrentNode ? color : null,
            lineDash: [2, 3],
          },
          name: 'current-node-box',
        });

        group.addShape('circle', {
          attrs: {
            x: 0,
            y: -h + 40,
            r: w / 4,
            stroke: color,
            fill: color,
          },
          name: 'main-box',
        });

        group.addShape('image', {
          attrs: {
            x: -12,
            y: -h / 3,
            width: w / 4,
            height: w / 4,
            img: imgMap[nodeDefinitionCode],
            stroke: '#47B881',
          },
          name: 'img-box',
        });
        // eslint-disable-next-line
        cfg.children &&
          group.addShape('marker', {
            attrs: {
              x: 34,
              y: h / 64,
              r: 6,
              cursor: 'pointer',
              symbol: cfg.collapsed ? G6.Marker.expand : G6.Marker.collapse,
              stroke: '#666',
              lineWidth: 1,
              fill: '#fff',
            },
            name: 'collapse-icon',
          });

        const nodeTitleTextContent = `${nodeName}${
          status !== 'VIRTUAL'
            ? `，${quantity === null ? 0 : quantity}${unit === null ? '' : unit}`
            : ''
          }`;
        const nodeTitleText = group.addShape('text', {
          attrs: {
            x: 0,
            y: h + 6,
            lineHeight: 20,
            textAlign: 'center',
            text: nodeTitleTextContent.length > 20 ? `${nodeTitleTextContent.slice(0, 18) }...` : nodeTitleTextContent,
            fill: 'rgba(0,0,0, 1)',
          },
          name: `node-title`,
        });

        if (false) {
          group.addShape('rect', {
            attrs: {
              x: nodeTitleText.getBBox().maxX + 5,
              y: h - 8,
              radius: [2, 2],
              width: 30,
              height: 16,
              fill: 'rgba(245,99,73,0.10)',
            },
            name: 'exception-msg-rect',
          });
          group.addShape('text', {
            attrs: {
              x: nodeTitleText.getBBox().maxX + 10,
              y: h + 5,
              lineHeight: 16,
              text: PromptMap.EXCEPTION_STATUS,
              fontSize: 10,
              fill: '#f53',
            },
            name: 'exception-msg-text',
          });
        }

        group.addShape('text', {
          attrs: {
            x: 0,
            y: h + 24,
            lineHeight: 20,
            textAlign: 'center',
            text: docNum,
            fill: status !== 'VIRTUAL' && isReadOnly === 0 && allAuthorityFlag ? getPrimaryColor() : '#191919',
            cursor: status !== 'VIRTUAL' && isReadOnly === 0 && allAuthorityFlag ? 'pointer' : 'default',
          },
          name: `node-text`,
        });

        return shape;
      },
      setState(name, value, item) {
        if (name === 'collapsed') {
          const marker = item && item.get('group').find((ele) => ele.get('name') === 'collapse-icon');
          const icon = value ? G6.Marker.expand : G6.Marker.collapse;
          marker.attr('symbol', icon);
        }
      },
    });

    // 注册连接线
    G6.registerEdge(
      'fund-polyline',
      {
        draw(cfg: any, group: any) {
          const { startPoint, endPoint, targetNode } = cfg;
          let color = colorMap.VIRTUAL;
          let endArrowFlag = true; // 连接线是否带箭头: 订单->商城订单无需箭头。
          if (
            targetNode &&
            targetNode._cfg &&
            targetNode._cfg.model &&
            targetNode._cfg.model.nodeDataCnfRecord
          ) {
            const { status } = targetNode._cfg.model.nodeDataCnfRecord;
            const { nodeDefinitionCode, fromPoEcpoFlag } = targetNode._cfg.model;
            endArrowFlag = !(nodeDefinitionCode === 'ECPO' && fromPoEcpoFlag === 1);
            color = colorMap[status ? 'FINISHED' : 'PROCESS'];
          }
          const line = group.addShape('path', {
            attrs: {
              lineWidth: 2,
              lineAppendWidth: 5,
              lineCap: 'miter',
              path: [
                ['M', startPoint.x || 0, startPoint.y || 0],
                ['L', endPoint.x || 0, endPoint.y || 0],
              ],
              stroke: color,
              endArrow: endArrowFlag ? {
                path: 'M 0,0 L 10,5 L 10,-5 Z',
                d: -0.8,
                stroke: color,
                fill: color,
              } : false,
            },
            name: 'path-shape',
          });
          return line;
        },
      },
      'cubic-horizontal'
    );
  };

  useEffect(() => {
    // 使用异步 保证先给 ref 进行赋值，保证对权限进行判断是有数据
    (async () => {
      handleDocChartLoading(true);
      // 查询节点权限,使用 ref 存储
      nodesAuthority.current = await queryNodesAuthority({
        currentOrganizationId,
      });

      if (tableName && tablePk) {
        // 查询 node 节点数据
        await queryAllNodes({
          tableName,
          tablePk,
          currentOrganizationId,
        }).then((res) => {
          if (getResponse(res)) {
            initChartElement();
            if (!flowGraph) {
              // G6 树形初始化
              flowGraph = new G6.TreeGraph({
                container: ref.current || '',
                width: 1160,
                height: 700,
                minZoom: 0.46, // 给个 -0.4 的偏移量作为数值范围计算放大的倍数为（0.5 - 3）
                maxZoom: 3.2, // 给个 0.2 的偏移量作为数值范围计算放大的倍数为（0.5 - 3）
                // fitView: true,
                modes: {
                  default: ['drag-canvas'],
                },
                plugins: [tooltipNode, tooltipEdge, zoomToolbar, legendToolBar, explainToolbar],
                animate: true,
                defaultNode: {
                  type: 'card-node',
                  size: [100, 40],
                },
                defaultEdge: {
                  type: 'fund-polyline',
                },
                layout: {
                  type: 'indented',
                  direction: 'LR',
                  dropCap: false,
                  indent: 240,
                  getHeight: () => {
                    return 60;
                  },
                },
              });
            }
            if (res && res[0]) {
              // 数据折叠
              // 非结算进入折叠结算后面节点
              G6.Util.traverseTree(res[0], function (item) {
                if (item.nodeDefinitionCode === 'SSTA_SETTLE' && item.isCurrentNode !== 1) {
                  item.collapsed = true;
                }
              });
              flowGraph.data(res[0]);
              flowGraph.render();
              // 计算位置
              const movePosition = getPosition(res);
              // 图标位置移动
              flowGraph.moveTo(movePosition.x, movePosition.y);
              // 节点点击事件
              flowGraph.on('node:click', (e) => {
                if (e.target.get('name') === 'collapse-icon') {
                  e.item.getModel().collapsed = !e.item.getModel().collapsed;
                  flowGraph.setItemState(e.item, 'collapsed', e.item.getModel().collapsed);
                  flowGraph.layout();
                }
                if (e.target.get('name') === 'node-text') {
                  const node = e.item;
                  const nodeModel = node.getModel();
                  if (nodeModel.status !== 'VIRTUAL') {
                    openReceiptInfo(nodeModel.id, nodeModel.docNum, nodeModel.nodeDefinitionCode, nodeModel.isReadOnly, nodeModel.ecpoId);
                  }
                }
              });
              // 图标连接线点击事件
              flowGraph.on('edge:mouseenter', (e) => {
                flowGraph.setItemState(e.item, 'active', true);
              });
              flowGraph.on('edge:mouseleave', (e) => {
                flowGraph.setItemState(e.item, 'active', false);
              });
              // 实现 按住 Control 按键可以放大缩小图
              flowGraph.on('keydown', (e) => {
                if (e.key === "Control") {
                  flowGraph.addBehaviors('zoom-canvas', 'default');
                }
              });
              // 实现 释放 Control 按键 取消可以放大缩小图
              flowGraph.on('keyup', (e) => {
                if (e.key === "Control") {
                  flowGraph.off('wheel');
                  flowGraph.removeBehaviors('zoom-canvas', 'default');
                }
              });
              // 处理鼠标滚动事件
              flowGraph.on('wheelzoom', () => {
                const percentDom = document.getElementById('docFlow-g6-component-toolbar-docFlow-percent') || document.createElement('input');
                const currentZoomNum = flowGraph.getZoom();
                let valueNum = 1;
                if (currentZoomNum < 0.5) {
                  flowGraph.zoomTo(0.5);
                  valueNum = 0.5;
                } else if (currentZoomNum > 3) {
                  flowGraph.zoomTo(3);
                  valueNum = 3;
                } else {
                  valueNum = parseFloat(currentZoomNum.toPrecision(2));
                }
                (percentDom as HTMLInputElement).value = (valueNum * 100 | 0).toString(); // 去掉类似 50.0 这种数据
              });
              // 添加事件监听
              addPercentDomBlurListener(flowGraph);
            }
          }
        });
      }
    })().finally(() => handleDocChartLoading(false));
  }, []);

  /**
   * 打开详情tab页
   * @param docRoute 路由地址
   */
  // const routeDetail = (docRoute) => {
  //   if (docRoute) {
  //     const {link, linkTitle} = docRoute;
  //     openTab({
  //       key: link,
  //       title: linkTitle,
  //     });
  //   } else {
  //     notification.warning({
  //       message: intl
  //         .get('component.docFlow.view.warning.routeDetail')
  //         .d('该数据未维护单据详情路由，请先维护！'),
  //     });
  //   }
  // };

  // const renderRouteButton = (docRoute, authorityFlag) => {
  //   return docRoute && authorityFlag ? (
  //     <Button onClick={() => routeDetail(docRoute)}>
  //       {intl.get('component.docFlow.view.button.docRoute').d('跳转单据详情')}
  //     </Button>
  //   ) : null
  // }

  /**
   * 根据节点定义code获取当前节点是否有所有权限以及权限Map
   * @param {String} nodeDefinitionCode 节点code
   * @returns
   */
  const getModalOpenAuthorityMap = (nodeDefinitionCode: string) => {
    // 获取到的权限是一个数组数据，使用当前节点的 nodeDefinitionCode 去进行过滤，过滤后剩下的数据就是当前节点类型在此租户下的权限配置
    const currentNodeAuthority = nodesAuthority.current.filter((node: AuthorityListNode) => node.nodeDefinitionCode === nodeDefinitionCode);
    // 对数组形式的权限数据进行转化，转化为 map 结构
    const authorityMap = {} as any;
    currentNodeAuthority.forEach((obj: AuthorityListNode) => {
      authorityMap[obj.authorityType] = obj.allocated;
    });
    return {
      authorityMap,
      allAuthorityFlag: !!currentNodeAuthority.find((n: AuthorityListNode) => n.allocated), // 如果所有的权限都是false的话, 说明总权限是 false
    };
  };

  /**
   * 点击节点单据打开modal弹框展示详情数据
   */
   const openReceiptInfo = useCallback( debounce((id, docNum, nodeDefinitionCode, isReadOnly, ecpoId) => {
    // let docRoute = null;
    const { authorityMap, allAuthorityFlag } = getModalOpenAuthorityMap(nodeDefinitionCode);
    // handleModalOpenFlag： 如果为所有权限为 false 或者 节点为只读， 都不进行弹框处理
    const handleModalOpenFlag = allAuthorityFlag && isReadOnly === 0;
    if (handleModalOpenFlag) {
      Modal.open({
        title: docNum,
        drawer: true,
        okCancel: false,
        closable: true,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        footer: (okBtn) => [
          okBtn,
          // renderRouteButton(docRoute, authorityMap.DETAILS),
        ],
        style: {
          width: 800,
        },
        children: (
          <DocInfo
            nodeDataId={id}
            currentOrganizationId={currentOrganizationId}
            authorityMap={authorityMap}
            nodeDefinitionCode={nodeDefinitionCode}
            currentUserId={currentUserId}
            ecpoId={ecpoId}
          />
        ),
      });
      // queryNodeDocRoute({ nodeDataId: id, currentOrganizationId }).then((res) => {
      //   const response = getResponse(res)
      //   if (response) {
      //     docRoute = response;
      //   }
      // }).finally(() => {

      // });
    }
  }, 500), [nodesAuthority]);

  return <Spin spinning={docChartLoading}><div className="doc-flow-chart" ref={ref} /></Spin>;
}

export default FlowChart;
