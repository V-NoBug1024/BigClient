import * as React from "react";
import { Toast, Modal } from "antd-mobile";
import TabBar from "components/Tab";
import TableView from "components/TableView";
import EmptyView, { EmptyType } from "components/EmptyView";
import * as api from "@services/bigClient";
import * as qs from "query-string";
import "./index.scss";

const columnInfo = {
  day: [
    { title: "区域及门店", width: "120px", key: "plantName" },
    { title: "日消费人数", width: "90px", key: "membcntDay" },
    { title: "日消费金额", width: "90px", key: "membamtDay" },
    { title: "占百货实收比", width: "90px", key: "bhPctgDay" },
    { title: "占VIP实收比", width: "90px", key: "vipPctgDay" },
    { title: "同比增幅", width: "90px", key: "pctgIncreaseDay" },
  ],
  month: [
    { title: "区域及门店", width: "120px", key: "plantName" },
    { title: "月消费人数", width: "90px", key: "membcntMonth" },
    { title: "月消费金额", width: "90px", key: "membamtMonth" },
    { title: "占百货实收比", width: "90px", key: "bhPctgMonth" },
    { title: "占VIP实收比", width: "90px", key: "vipPctgMonth" },
    { title: "同比增幅", width: "90px", key: "pctgIncreaseMonth" },
  ],
  maintain: [
    { title: "区域及门店", width: "120px", key: "plantName" },
    { title: "总人数", width: "90px", key: "allCnt" },
    { title: "保持组", width: "90px", key: "activeCnt" },
    { title: "唤醒组", width: "90px", key: "awakeCnt" },
    { title: "激活组", width: "90px", key: "wakedCnt" },
    { title: "流失组", width: "90px", key: "lostCnt" },
  ],
};

const tabList = [
  { name: "日数据", id: 1, key: "day" },
  { name: "月数据", id: 2, key: "month" },
  { name: "月维护人数", id: 3, key: "maintain" },
];

interface IProps {}

interface IState {
  reportDate: string;
  dataSource: any;
  columns: any;
  showModal: boolean;
}

class BigClient extends React.PureComponent<IProps, IState> {
  msgid: string;
  constructor(props: IProps) {
    super(props);
    const params = qs.parse(window.location.search);
    this.msgid = params.msgid;
    this.state = {
      dataSource: [],
      columns: columnInfo["day"],
      showModal: false,
      reportDate: "",
    };
  }

  // 获取大客户数据
  getClientList = (param: any) => {
    Toast.loading("加载中....");
    api
      .geClientListInfo(param)
      .then((rs: any) => {
        Toast.hide();
        const customerInfo = rs.largeCustomerSum || {};
        Object.assign(customerInfo, { plantName: "总计", type: "total" });
        const dataList = rs.areaDataList || [];
        dataList.map((item: any, index: number) =>
          Object.assign(item, {
            plantName: item.dataTypeName,
            type: "yellow",
          })
        );
        dataList.push(customerInfo);
        this.setState({ dataSource: dataList, reportDate: rs.reportDate });
      })
      .catch(() => {
        Toast.hide();
      });
  };

  // 菜单切换
  onTabBarChange = (info: any) => {
    const { id } = info;
    let key = "day";
    if (+id === 2) {
      key = "month";
    } else if (+id === 3) {
      key = "maintain";
    }

    const left = document.getElementById("left-scroll");
    if (left) left.scrollLeft = 0;

    const columns = columnInfo[key] || [];
    this.setState({ columns });
    this.getClientList({ msgid: this.msgid, type: id });
  };

  //
  onExpansion = (expansion: boolean, rowKey: any) => {
    const list = [...this.state.dataSource];
    list.map((item: any) => {
      if (item.area === rowKey) item.expansion = expansion;
    });
    this.setState({ dataSource: list });
  };

  //
  onShowModal = (visible: boolean) => {
    this.setState({ showModal: visible });
  };

  componentDidMount() {
    document.title = "大客户消费统计日报";
    this.getClientList({ msgid: this.msgid, type: 1 });
  }

  // 渲染
  render() {
    const { columns = [], dataSource = [], reportDate = "" } = this.state;
    return (
      <>
        {dataSource.length === 0 ? (
          <EmptyView
            emptyType={EmptyType.emptyTypeNone}
            tipImage={require("assets/images/icon_nodata.png")}
          />
        ) : (
          <div className="big-client-container">
            <div className="date-text">{reportDate}</div>
            <TabBar
              className="tab-bar"
              theme="round"
              data={tabList}
              handleChange={this.onTabBarChange}
            />
            <TableView
              className="table-view"
              columns={columns}
              dataList={dataSource}
              onExpansion={this.onExpansion}
              rowKey="area"
              fixed
              scrollX="570px"
            />

            {/* 提示语 */}
            <div
              className="tip"
              onClick={() => {
                this.onShowModal(true);
              }}
            >
              <div>统计口径说明</div>
              <div className="img">
                <img
                  style={{ width: "100%", height: "100%" }}
                  src={require(`../../assets/images/icon_help_dark.png`)}
                />
              </div>
            </div>
            {/* 弹框 */}
            <Modal
              visible={this.state.showModal}
              title={<div className="modal-title">统计口径说明</div>}
              transparent
              footer={[
                {
                  text: "关闭",
                  onPress: () => {
                    this.onShowModal(false);
                  },
                  style: { color: "#fe981e" },
                },
              ]}
            >
              <div>
                <div>1、取柜组类型为1、2、3、8的大客户销售</div>
                <div>2、统计金额单位：万元</div>
              </div>
            </Modal>
          </div>
        )}
      </>
    );
  }
}

export default BigClient;
