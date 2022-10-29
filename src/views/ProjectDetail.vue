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
            </el-form-item>

            <el-form-item label="项目名称">
              <el-input v-model="project_detail.name"></el-input>
            </el-form-item>

            <el-form-item label="脚本列表">
              <el-select v-model="project_detail.scripts" multiple placeholder="请选择脚本" style="width: 100%">
                <el-option
                    v-for="(i,index) in script_list"
                    :label=" '【' +index+ '】'+ i"
                    :value="i"
                ></el-option>
              </el-select>
              <el-upload
                  style="float: left"
                  :action="get_action()"
                  :limit="5"
                  :on-exceed="handleExceed"
                  :before-remove="beforeRemove"
                  :on-success="get_script_list"
                  name="script_file">
                <el-button type="primary">上传脚本</el-button>
                <span style="font-size: xx-small;color: darkgray">（脚本上传后，可以在脚本列表输入框中选中，上传重名的脚本会覆盖）</span>
              </el-upload>
            </el-form-item>

            <el-form-item label="压测计划">
              <el-input v-model="project_detail.plan"></el-input>
            </el-form-item>
            <el-form-item label="计划说明" style="text-align: left">
              <span style="font-size: xx-small;color: red">
                (多个阶段用英文逗号,隔开）（每秒发一轮）（请不要忽略压测机性能而随意填充大数宇）<br>
                【常量压测】0-5-2：下标为0（指第一个脚本）执行2轮，每轮5个并发。<br>
                【阶梯增压】0-10/90-5：下标为0的脚本执行5轮，并发量从10逐步升到90，即 (10,30,50,70,90)<br>
                【无限增压】0-10+5：下标为0的脚本从10并发开始，每轮增加5个并发量，(安全阀为100轮）注意增量不要过大。<br>
                【瞬时增压】0-10_100_1000-5：下标为0的脚本从10并发执行5轮后，突然增压到100并发并执行5轮后，再突然增压到1000并发并执行5轮，以此类推。<br>
              </span>
            </el-form-item>
            <el-form-item>
              <el-button @click="run_visible=true" type="primary">加入队列</el-button>
              <el-button @click="restore">恢复默认</el-button>
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
    get_action() {//自定义上传文件路径
      return process.env.VUE_APP_BASE_URL + '/upload_script_file/'
    },
    handleExceed(files, fileList) {//限制上传提示
      this.$message.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    },
    beforeRemove(file, fileList) {//删除二次提示
      return this.$confirm(`确定移除 ${file.name}？`);
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