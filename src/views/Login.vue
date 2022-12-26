<template>
  <div class="lb">
    <el-card style="float: right;width: 500px;height: 300px;margin-top:150px;background-color: grey">
      <h2>欢迎登录压测平台</h2>
      <el-form :model="form">
        <el-form-item>
          <el-input prefix-icon="el-icon-user-solid" clearable v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input prefix-icon="el-icon-lock" clearable v-model="form.password" show-password
                    placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-button @click="login_act" type="success">登录</el-button>
        <el-button @click="register_act" type="primary">注册</el-button>
      </el-form>
    </el-card>
    <el-carousel :interval="2000" :height="screenheight">
      <el-carousel-item v-for="item in 3" :key="item" style="border-radius: 5px;box-shadow: 4px 4px 8px black">
        <img :src=" require('../assets/'+item+'.png') " alt="" style="height:100%;width: 100%">
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  data() {
    return {
      screenheight: document.documentElement.clientHeight + 'px',
      form: {
        username: '',
        password: '',
      }
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        this.screenheight = document.documentElement.clientHeight + 'px'
      })
    }
  },
  methods: {
    login_act() {
      axios.post('/login_act/', this.form).then(res => {
        if (res.data.result == 0) {
          // 把用户名写入cookie
          sessionStorage.setItem('username', this.form.username);
          // 跳转到首页
          this.$router.replace('/home')
        } else {
          alert('用户名或密码错误!')
        }
      })
    },
    register_act() {
      axios.post('/register_act/', this.form).then(res => {
        if (res.data.result == 0) {
          this.$message({
            message: '注册成功',
            type: 'success'
          })
        } else {
          this.$message({
            message: '用户名已存在',
            type: 'error'
          })
        }
      })
    },

  },
}
</script>

<style scoped>
.lb {
  width: 100%;
  height: 100%;
  /*background-image: url("../assets/base.png");*/
  background-size: 120% 100%;
  background-position: center center;
  overflow: auto;
  position: fixed;
  background-color:grey;
}
</style>