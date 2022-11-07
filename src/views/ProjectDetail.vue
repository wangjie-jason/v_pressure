<template>
  <div style="height: 100%">
    <el-container style="height: 100%">
      <el-aside width="200px">
        <Menu></Menu>
      </el-aside>
      <el-container>
        <el-header>
          <h1>项目详情页: ID={{ $route.query.project_id }}</h1>
        </el-header>
        <el-main>
          <el-form :model="project_detail" label-width="80px">
            <el-form-item label="项目ID : " style="text-align: left">
              {{ project_detail.id }}
              &#12288;
              <el-button @click="run_visible=true" type="primary">加入队列</el-button>
              <el-button @click="restore">恢复默认</el-button>
            </el-form-item>

            <el-form-item label="项目名称">
              <el-input v-model="project_detail.name"></el-input>
            </el-form-item>

            <el-form-item label="压测计划">
              <el-table :data="project_detail.plan">
                <el-table-column width="200" label="脚本名">
                  <template slot-scope="scope">
                    <el-select v-model="scope.row.name" placeholder="请选择">
                      <el-option
                          v-for="i in script_list"
                          :value="i"
                          :label="i">
                      </el-option>
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column width="80">
                  <template slot-scope="scope">
                    <span v-text="get_text(scope.row.name)"></span>
                  </template>
                </el-table-column>
                <el-table-column width="120" label="原始并发数">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.old_num"></el-input>
                  </template>
                </el-table-column>
                <el-table-column width="120" label="原始轮数">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.old_round"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="脚本参数">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.script_params"></el-input>
                  </template>
                </el-table-column>

                <el-table-column>
                  <template slot="header">
                    <el-button size="mini" @click="add_step">新增阶段</el-button>
                  </template>
                  <template slot-scope="scope">
                    <el-button size="mini" type="danger" @click="delete_step(scope.$index)">删除阶段</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item label="计划说明" style="text-align: left">
              <span style="font-size: xx-small;color: red">
                 每个阶段运行完成后才会运行下一阶段，每秒发一轮并发。（请不要忽略压测机性能而随意填充大数宇）<br>
                【常量压测】原始并发数=5，原始轮数=2：此阶段脚本执行2轮，每轮5个并发。<br>
                【阶梯增压】原始并发数=10/90，原始轮数=5：此阶段脚本执行5轮，并发量从10逐步升到90，即 (10,30,50,70,90)<br>
                【无限增压】原始并发数=10+，原始轮数=5：此阶段脚本从10并发开始，每轮增加5个并发量，(安全阀为100轮）注意增量不要过大。<br>
                【瞬时增压】原始并发数=10_100_1000，原始轮数=5：此阶段脚本从10并发执行5轮后，突然增压到100并发并执行5轮后，再突然增压到1000并发并执行5轮，以此类推。<br>
              </span>
            </el-form-item>
            <el-form-item label="脚本参数" style="text-align: left">
              <span style="font-size: xx-small;color: red">
                【other】其他类型脚本为调用shell命令方式运行，脚本参数用空格隔开。 <br>
                【python】类型脚本为函数调用方式运行，入口函数调用及传参按此格式：函数名(参数1,参数2...)
              </span>
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
    </el-container>
    <el-dialog :close-on-click-modal="false" title="新建任务到队列..." :visible.sync="run_visible">
      <el-input v-model="des" placeholder="请输入任务描述"></el-input>
      <br><br>
      <el-button @click="run" type="success">确定</el-button>
      <el-button @click="run_visible=false">取消</el-button>
    </el-dialog>
  </div>
</template>

<script>

import axios from "axios";
import Menu from "@/components/Menu";


export default {
  name: "ProjectDetail",
  data() {
    return {
      project_detail: {},
      script_list: [],
      des: "",
      run_visible: false,
    }
  },
  mounted() {
    axios.get('/get_project_detail/', {
      params: {
        project_id: this.$route.query.project_id
      }
    }).then(res => {
      this.project_detail = res.data
    })
    this.get_script_list()
  },
  watch: {
    $route() {//监听路由，如果发生变化就执行mounted里的方法刷新页面
      axios.get('/get_project_detail/', {
        params: {
          project_id: this.$route.query.project_id
        }
      }).then(res => {
        this.project_detail = res.data
      })
    }
  },
  methods: {
    get_text(name) {
      if (name.split('/')[0] == 'other') {
        return '低性能'
      } else if (name.split('/')[0] == 'python') {
        return '中高性能'
      } else if (name.split('/')[0] == 'go') {
        return '高性能'
      }
    },
    delete_step(index) {
      this.project_detail.plan.splice(index, 1)
    },
    add_step() {
      this.project_detail.plan.push({'name': '', 'old_num': '', 'old_round': '', 'script_params': ''})
    },
    get_script_list() {
      axios.get('/get_script_list/').then(res => {
        this.script_list = res.data
      })
    },
    restore() {
      window.location.reload()
    },
    run() {
      axios.post('/save_project/', this.project_detail).then(res => {
        axios.get('/add_task/', {
          params: {
            des: this.des,
            project_id: this.project_detail.id
          }
        }).then(res => {
          this.run_visible = false;
          this.$message({
            message: "加入队列成功",
            type: "success"
          })
        })
      })
    },
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
  background-color: #e3eaed;
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