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
              <el-input v-model="project_detail.scripts"></el-input>
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
    }
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