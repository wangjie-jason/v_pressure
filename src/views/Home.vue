<template>
  <div style="height: 100%">
    <el-container style="height: 100%">
      <el-aside width="200px">
        <Menu></Menu>
      </el-aside>
      <el-container>
        <el-header>欢迎来到压测平台</el-header>
        <el-main>
          <el-card style="height: calc(100% - 410px);width: 30%;float: left;">
            <div slot="header" class="clearfix">项目概览</div>
            <p>平台项目数：20</p>
            <p>历史项目数：130</p>
            <p>平台用户数：12</p>
          </el-card>
          <el-card style="height: calc(100% - 410px);width: calc(70% - 5px);">
            <div slot="header" class="clearfix">正在运行的压测任务</div>
            <span style="font-size: xx-small">任务1</span>
            <el-progress :percentage="50"></el-progress>
            <span style="font-size: xx-small">任务2</span>
            <el-progress :percentage="70"></el-progress>
            <span style="font-size: xx-small">任务3</span>
            <el-progress :percentage="100"></el-progress>
          </el-card>
          <el-card style="height: 400px">
            <div slot="header" class="clearfix">
              历史压测结果
            </div>
            <div id="myChart" style="width: 100%;height: 300px"></div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

// 导入echarts
import axios from "axios";
import Menu from "@/components/Menu";

let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
import {GridComponent} from 'echarts/components'

echarts.use([GridComponent]);

export default {
  name: "Home",
  data() {
    return {
      username: '',
      option: {
        legend: {data: []}, //标题
        xAxis: {
          type: 'category', //样式
          data: [], //x轴数据
          name: '日期',
          nameTextStyle: {
            fontWeight: 400, //字体宽度
            fontSize: 15, //字体大小
            color: 'green' //字体颜色
          },
          axisTick: {
            show: true, //显示刻度
            alignWithLabel: true, //对齐文案
            interval: '0', //刻度间距
            length: 5, //标尺长度
            inside: false //标尺 标记 朝向
          },
          axisLabel: {
            interval: 0, //刻度间距
            rotate: 0 //角度旋转
          }
        },
        yAxis: { //y轴数据
          type: 'value',
          name: '压测次数',
          nameTextStyle: {
            fontWeight: 400,
            fontSize: 15,
          }
        },
        label: {},
        tooltip: {trigger: 'item'}, //折叠展示的样式
        series: [] //y轴 时间轴 数据。
      }
    }
  },
  mounted() {
    this.username = sessionStorage.getItem('username');

    axios.get('/get_echarts_data/').then(res => {
      this.option.legend.data = res.data.legend_data;
      this.option.xAxis.data = res.data.xAxis_data;
      this.option.series = res.data.series;

      let myChart = echarts.init(document.getElementById('myChart'))
      myChart.setOption(this.option)
    })
  },
  components: {
    Menu,
  }
}
</script>

<style scoped>
.el-aside {
  background-color: white;
  text-align: center;
  border-right: 1px solid #c1c1c1;
}

.el-header {
  background-color: white;
  text-align: center;
  border-bottom: 1px solid #c1c1c1;
}

.el-main {
  background-color: #2c3e50;
}

.el-card {
  background-color: white;
  text-align: left;
  overflow-y: auto;
}

p {
  font-size: small;
}

</style>