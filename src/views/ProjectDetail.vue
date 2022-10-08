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
                  :limit="3"
                  :on-exceed="handleExceed"
                  :before-remove="beforeRemove"
                  name="script_file">
                <el-button type="primary">上传脚本</el-button>
                <span style="font-size: xx-small;color: darkgray">（脚本上传后，可以在脚本列表输入框中选中，上传重名的脚本会覆盖）</span>
              </el-upload>
            </el-form-item>

            <el-form-item label="压测计划">
              <el-input v-model="project_detail.plan"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="save_project" type="primary">保存</el-button>
              <el-button @click="restore">恢复默认</el-button>
            </el-form-item>
          </el-form>
        </el-main>
      </el-container>
    </el-container>
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
    axios.get('/get_script_list/').then(res => {
      this.script_list = res.data
    })
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
    restore() {
      window.location.reload()
    },
    save_project() {
      axios.post('/save_project/', this.project_detail).then(res => {
        this.$message({
          message: '保存成功',
          type: "success"
        })
      })
    },
    get_action() {//自定义上传文件路径
      return process.env.VUE_APP_BASE_URL + '/upload_script_file/'
    },
    handleExceed(files, fileList) {//限制上传提示
      this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
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