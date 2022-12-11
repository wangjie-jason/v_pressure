<template>
  <div>
    <el-menu
        class="el-menu-vertical-demo"
        router
        background-color="white"
        :default-openeds="['1','2']"
        :default-active="now_path">
      <el-menu-item index="/home">回到首页</el-menu-item>
      <el-submenu index="1">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span>功能区</span>
        </template>
        <el-menu-item @click="project_list_visible=true">项目管理</el-menu-item>
        <el-menu-item @click="get_tasks">任务面板</el-menu-item>
        <el-menu-item @click="up_script_visible=true">上传脚本/日志</el-menu-item>
      </el-submenu>

      <el-submenu index="2">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span>维护区</span>
        </template>
        <a href="http://localhost:8000/admin">
          <el-menu-item>进入后台</el-menu-item>
        </a>
        <a href="http://localhost:8000/admin/auth/user/">
          <el-menu-item>用户管理</el-menu-item>
        </a>
        <a href="http://localhost:8000/clear_all/">
          <el-menu-item>清空任务和消息</el-menu-item>
        </a>
      </el-submenu>
      <el-menu-item @click="logout" style="color: grey;font-size: xx-small"> 退出 {{ username }}</el-menu-item>
    </el-menu>

    <el-dialog title="项目列表" :visible.sync="project_list_visible">
      <el-table :data="part_projects">
        <el-table-column property="id" label="ID" width="50"></el-table-column>
        <el-table-column property="name" label="项目名称"></el-table-column>
        <el-table-column width="150">
          <template slot="header">
            <el-button style="width: 121px" @click="add_project">新增项目</el-button>
          </template>
          <template slot-scope="scope">
            <el-button @click="into(scope.row.id)" size="mini" type="success">进入</el-button>
            <el-button size="mini" type="danger" @click="delete_project(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <br>
      <el-pagination
          small
          layout="prev, pager, next"
          :total="projects_total"
          :page-size="projects_pz"
          @current-change="projects_cc">
      </el-pagination>
    </el-dialog>
    <el-dialog :before-close="close_tasks" title="任务列表" width="80%" :visible.sync="task_visible">
      <el-table :data="part_tasks">
        <el-table-column property="id" label="任务ID" width="100"></el-table-column>
        <el-table-column property="mq_id" label="消息ID" width="100"></el-table-column>
        <el-table-column property="project_id" label="项目ID" width="100"></el-table-column>
        <el-table-column property="status" label="状态" width="100">
          <template slot-scope="scope">
            <p :style="{color:get_color(scope.row.status)}"><strong>{{ scope.row.status }}</strong></p>
          </template>
        </el-table-column>
        <el-table-column property="stime" label="创建时间" width="200"></el-table-column>
        <el-table-column property="des" label="任务描述"></el-table-column>
        <el-table-column width="200">
          <template slot-scope="scope">
            <el-button :disabled="!get_able(scope.row.status)" @click="report(scope.row.id)" size="mini" type="primary">
              报告
            </el-button>
            <el-button :disabled="get_able(scope.row.status)" :id="'stop_btn_'+scope.row.id"
                       @click="stop_task(scope.row.id)" size="mini" type="danger">{{ scope.row.stop ? '已终止' : '终止' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <br>
      <el-pagination
          small
          layout="prev, pager, next"
          :total="tasks_total"
          :page-size="tasks_pz"
          @current-change="tasks_cc">
      </el-pagination>
    </el-dialog>
    <el-dialog title="上传脚本/日志" :visible.sync="up_script_visible">
      <el-select v-model="script_model">
        <el-option label="other脚本（低性能）" value="other"></el-option>
        <el-option label="python脚本（中性能）" value="python"></el-option>
        <el-option label="go脚本（高性能）" value="go"></el-option>
        <el-option label="回放日志" value="logs"></el-option>
      </el-select>
      <br><br><br>
      <el-upload
          :data="{'script_model':script_model}"
          :action="get_action()"
          :limit="5"
          :on-exceed="handleExceed"
          :before-remove="beforeRemove"
          name="script_file">
        <el-button type="primary">上传</el-button>
      </el-upload>
    </el-dialog>
    <el-dialog :title="'性能测试报告:  '+now_task_id" :visible.sync="report_visible" width="90%">
      <div id="myChart" style="width: 100%;height: 300px"></div>
      <el-button @click="bh">变换平均时间</el-button>
      &nbsp;
      <el-button @click="look_detail_thread">查看详细并发数</el-button>
      <el-table :data="time_detail">
        <el-table-column width="100">
          <template slot-scope="scope">
            阶段【{{ scope.$index + 1 }}】
          </template>
        </el-table-column>
        <el-table-column align="center" property="step_avg_time" label="平均时间(s)" width="100"></el-table-column>
        <el-table-column align="center" property="step_50_line" label="50% LINE" width="100"></el-table-column>
        <el-table-column align="center" property="step_80_line" label="80% LINE" width="100"></el-table-column>
        <el-table-column align="center" property="step_90_line" label="90% LINE" width="100"></el-table-column>
        <el-table-column align="center" property="step_95_line" label="95% LINE" width="100"></el-table-column>
        <el-table-column align="center" property="step_99_line" label="99% LINE" width="100"></el-table-column>
        <el-table-column align="center" property="step_fail" label="错误率" width="100"></el-table-column>
        <el-table-column align="center" property="step_min" label="MIN" width="100"></el-table-column>
        <el-table-column align="center" property="step_max" label="MAX" width="100"></el-table-column>
        <el-table-column align="center" property="step_tps" label="TPS" width="100"></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

// 导入echarts
let echarts = require('echarts/lib/echarts')
require('echarts/lib/chart/line')
require('echarts/lib/component/tooltip')
require('echarts/lib/component/title')
require('echarts/lib/component/legend')
import {GridComponent} from 'echarts/components'

echarts.use([GridComponent]);

export default {
  name: "Menu",
  data() {
    return {
      //项目管理及任务面板相关变量
      projects: [],
      project_list_visible: false,
      username: '',
      now_path: window.location.href.split('#')[1].split('?')[0],
      task_visible: false,
      tasks: [],
      //项目列表翻页相关变量
      projects_total: 0,
      projects_pz: 5,
      part_projects: [],
      projects_pageNumber: 1,
      //任务列表翻页相关变量
      tasks_total: 0,
      tasks_pz: 5,
      part_tasks: [],
      tasks_pageNumber: 1,
      //上传脚本相关变量
      up_script_visible: false,
      script_model: 'other',
      //任务报告相关变量
      time_detail: [],
      thread_detail: '',
      bh_switch: false,
      now_task_id: '',
      report_visible: false,
      option: {
        legend: {data: []}, //标题
        xAxis: {
          type: 'category', //样式
          data: [], //x轴数据
          name: '自然时间轴(s)',
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
          name: '平均时间&线程数',
          nameTextStyle: {
            fontWeight: 400,
            fontSize: 15,
          }
        },
        label: {},
        tooltip: {trigger: 'item'}, //折叠展示的样式
        series: [] //y轴 时间轴 数据。
      },//echarts数据源
    }
  },
  mounted() {
    this.username = sessionStorage.getItem('username')
    if (this.username == null) {
      window.location.href = '/'
    }
    axios.get('/get_projects/').then(res => {
      this.projects = res.data
      this.projects_total = this.projects.length
      this.projects_cc(1)
    })
  },
  methods: {
    look_detail_thread() {
      this.$alert(this.thread_detail, '详细并发数', {
        confirmButtonText: '关闭',
      });
    },
    bh() {
      this.bh_switch = !this.bh_switch
      this.report(this.now_task_id)
    },
    report(task_id) {
      this.report_visible = true
      this.now_task_id = task_id

      axios.get('/get_all_times/', {
        params: {
          task_id: task_id,
          bh_switch: this.bh_switch
        }
      }).then(res => {
        this.option.xAxis.axisLabel.interval = parseInt(res.data.option.xAxis_data.length / 30) //当x轴数据过大时，修改x轴刻度间距
        this.time_detail = res.data.time_detail
        this.thread_detail = res.data.thread_detail
        this.option.legend.data = res.data.option.legend_data;
        this.option.xAxis.data = res.data.option.xAxis_data;
        this.option.series = res.data.option.series;

        var chart_div = document.getElementById('myChart')
        if (chart_div.hasAttribute('_echarts_instance_')) {
          chart_div.removeAttribute('_echarts_instance_')
        }

        let myChart = echarts.init(chart_div)
        myChart.setOption(this.option)
      })
    },
    get_action() {//自定义上传文件路径
      return process.env.VUE_APP_BASE_URL + '/upload_script_file/'
    },
    handleExceed(files, fileList) {//限制上传提示
      this.$message.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {//删除二次提示
      return this.$confirm(`确定移除 ${file.name}？`);
    },
    projects_cc(pageNumber) {
      if (pageNumber - this.projects_total / this.projects_pz >= 1 && pageNumber > 1) {
        pageNumber--
      }
      this.part_projects = this.projects.slice((pageNumber - 1) * this.projects_pz, pageNumber * this.projects_pz)
      this.projects_pageNumber = pageNumber
    },
    tasks_cc(pageNumber) {
      if (pageNumber - this.tasks_total / this.tasks_pz >= 1 && pageNumber > 1) {
        pageNumber--;
      }
      this.part_tasks = this.tasks.slice((pageNumber - 1) * this.tasks_pz, pageNumber * this.tasks_pz)
      this.tasks_pageNumber = pageNumber
    },
    into(id) {
      this.$router.push('/project_detail/?project_id=' + id);
      window.location.reload()
    },
    logout() {
      sessionStorage.clear()
      window.location.href = '/'
    },
    add_project() {
      axios.get('/add_project/').then(res => {
        this.projects = res.data
        this.projects_total = this.projects.length
        this.projects_cc(this.projects_pageNumber)
      })
    },
    delete_project(project_id) {
      axios.get('/delete_project/', {
        params: {
          project_id: project_id
        }
      }).then(res => {
        this.projects = res.data
        this.projects_total = this.projects.length
        this.projects_cc(this.projects_pageNumber)
      })
    },
    get_tasks() {
      this.task_visible = true
      this.get_tasks_act()
      this.t1 = setInterval(() => {//每隔2s，自动重复执行里面的函数
        this.get_tasks_act()
      }, 2000)
    },
    close_tasks(done) {
      clearInterval(this.t1)
      done()
    },
    get_tasks_act() {
      axios.get('/get_tasks/').then(res => {
        this.tasks = res.data
        this.tasks_total = this.tasks.length
        this.tasks_cc(this.tasks_pageNumber)
      })
    },
    get_color(status) {
      if (status == '队列中') {
        return 'blue'
      } else if (status == '压测中') {
        return 'green'
      } else {
        return 'black'
      }
    },
    stop_task(id) {
      var d = document.getElementById('stop_btn_' + id)
      d.innerText = "终止中..."
      axios.get('/stop_task/?id=' + id).then(res => {
        d.innerText = '已终止'
        this.$message({
          message: res.data.Message,
          type: "error"
        })
      })
    },
    get_able(status) {
      if (status == '队列中' || status == '压测中') {
        return false
      } else {
        return true
      }
    },
  }
}
</script>

<style scoped>
a {
  text-decoration: none;
  color: black;
}

span {
  /*box-shadow: 4px 4px 8px grey;*/
  padding: 5px 20px;
  border-radius: 10px;
}
</style>