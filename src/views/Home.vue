<template>
  <div style="height: 100%">
    <el-container style="height: 100%">
      <el-aside width="200px">
        <Menu></Menu>
      </el-aside>
      <el-container>
        <el-header>
          <h1>欢迎来到压测平台</h1>
        </el-header>
        <el-main>
          <el-card style="height: calc(100% - 410px);width: 30%;float: left;">
            <div slot="header" class="clearfix">项目概览</div>
            <p>项目总数：{{ home_data.all_projects_count }}</p>
            <p>压测总数：{{ home_data.all_pressures_count }}</p>
            <p>脚本总数：{{ home_data.all_scripts_count }}</p>
            <p>日志总数：{{ home_data.all_logs_count }}</p>
            <p>用户总数：{{ home_data.all_users_count }}</p>
          </el-card>
          <el-card style="height: calc(100% - 410px);width: calc(70% - 5px);">
            <div slot="header" class="clearfix">正在运行的压测任务</div>

            <el-empty v-if="empty" :image-size="40" description="暂无压测任务运行"></el-empty>
            <!--            run_tasks = [{"des":"任务描述","progress":"50"},{}]-->
            <div v-for="task in home_data.run_tasks">
              <span style="font-size: xx-small">项目ID：{{ task.project_id }}</span> <br>
              <span style="font-size: xx-small">项目名称：{{ task.project_name }}</span> <br>
              <span style="font-size: xx-small">任务描述：{{ task.des }}</span>
              <el-progress :percentage="task.progress"></el-progress>
              <span style="font-size: xx-small">压测计划：</span> <br>
              <span style="font-size: xx-small" v-for="plan in task.plan">
                {{ plan }} <br>
              </span>
            </div>
          </el-card>
          <el-card style="height: 400px">
            <div slot="header" class="clearfix">
              平台使用情况
            </div>
            <div id="myChart" style="width: 100%;height: 300px"></div>
          </el-card>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

import axios from "axios";
import Menu from "@/components/Menu";

// 导入echarts
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
      home_data: {},
      empty: true,
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
          name: '',
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

    axios.get('/get_home_data/').then(res => {
      this.home_data = res.data
      if (this.home_data.run_tasks.length == 0) {
        this.empty = true
      } else {
        this.empty = false
      }
    })

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