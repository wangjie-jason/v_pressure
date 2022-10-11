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
        <el-menu-item index="/env_set">环境设置</el-menu-item>
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
      </el-submenu>
      <el-menu-item @click="logout" style="color: grey;font-size: xx-small"> 退出 {{ username }}</el-menu-item>
    </el-menu>

    <el-dialog title="项目列表" :visible.sync="project_list_visible">
      <el-table :data="projects">
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
    </el-dialog>
    <el-dialog title="任务列表" width="80%" :visible.sync="task_visible">
      <el-table :data="tasks">
        <el-table-column property="id" label="ID" width="50"></el-table-column>
        <el-table-column property="project_id" label="项目ID" width="100"></el-table-column>
        <el-table-column property="status" label="状态" width="100"></el-table-column>
        <el-table-column property="stime" label="创建时间" width="200"></el-table-column>
        <el-table-column property="des" label="任务描述"></el-table-column>
        <el-table-column width="150">
          <template slot-scope="scope">
            <el-button size="mini" type="primary">报告</el-button>
            <el-button size="mini" type="danger">终止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Menu",
  data() {
    return {
      projects: [],
      project_list_visible: false,
      username: '',
      now_path: window.location.href.split('#')[1].split('?')[0],
      task_visible: false,
      tasks: []
    }
  },
  mounted() {
    this.username = sessionStorage.getItem('username')
    if (this.username == null) {
      window.location.href = '/'
    }
    axios.get('/get_projects/').then(res => {
      this.projects = res.data
    })
  },
  methods: {
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
      })
    },
    delete_project(project_id) {
      axios.get('/delete_project/', {
        params: {
          project_id: project_id
        }
      }).then(res => {
        this.projects = res.data
      })
    },
    get_tasks() {
      this.task_visible = true
      axios.get('/get_tasks/').then(res => {
        this.tasks = res.data
      })
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