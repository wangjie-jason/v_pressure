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
            <el-form-item label="数据文件" style="text-align: left">
              <el-upload
                  :action="'/upload_data_file/?project_id='+project_detail.id"
                  limit="1"
                  name="data_file">
                <el-button style="width: 100px">上传</el-button>
                <template slot="tip">
                  &#12288;
                  <span style="color: darkgray;font-size: xx-small">文件仅限一个，在变量中使用不同的列，文件内容全部求值，无法求值一律按字符串处理</span>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item label="变量设置">
              <el-table :data="project_detail.variable">
                <el-table-column label="变量名">
                  <template slot-scope="scope">
                    <el-input v-model="scope.row.key"></el-input>
                  </template>
                </el-table-column>
                <el-table-column label="内容" width="520">
                  <template slot-scope="scope">
                    <el-autocomplete
                        style="width: 100%"
                        class="inline-input"
                        v-model="scope.row.value"
                        :fetch-suggestions="querySearch"
                        placeholder="请选择输入建议">
                      <template slot-scope="{item}">
                        <div class="name">{{ item.des }}
                          <span
                              style="font-size: xx-small;color: #8c939d">{{ item.value }}
                          </span>
                        </div>
                      </template>
                    </el-autocomplete>
                  </template>
                </el-table-column>
                <el-table-column>
                  <template slot="header">
                    <el-button size="mini" @click="add_variable">新增变量</el-button>
                  </template>
                  <template slot-scope="scope">
                    <el-button size="mini" @click="delete_variable(scope.$index)" type="danger">删除变量</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item label="计划说明" style="text-align: left">
              <span style="font-size: xx-small;color: red">
                 每个阶段运行完成后才会运行下一阶段，每秒发一轮并发。（请不要忽略压测机性能而随意填充大数宇）<br>
                【常量压测】原始并发数=5，原始轮数=2：此阶段脚本执行2轮，每轮5个并发。<br>
                【持续压测】原始并发数=5，原始轮数=120s：此阶段脚本执行5个并发，持续120s。<br>
                【阶梯增压】原始并发数=10/90，原始轮数=5：此阶段脚本执行5轮，并发量从10逐步升到90，即 (10,30,50,70,90)。<br>
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
      restaurants: [],//输入框联想内容
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
    this.restaurants = this.loadAll()
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
    add_variable() {
      this.project_detail.variable.push({"key": "", "value": ""})
    },
    delete_variable(index) {
      this.project_detail.variable.splice(index, 1)
    },
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
      // 判断阶段内是否有空值，如果有就弹提示
      for (var i = 0; i < this.project_detail.plan.length; i++) {
        if (this.project_detail.plan[i].name == '' || this.project_detail.plan[i].old_num == '' || this.project_detail.plan[i].old_round == '') {
          this.$message({
            message: "压测计划脚本名/原始并发数/原始轮数不能为空！",
            type: "error"
          })
          return
        }
      }
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
    // 输入建议函数组
    querySearch(queryString, cb) {
      var restaurants = this.restaurants;
      var results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
      cb(results)
    },
    createFilter(queryString) {
      return (restaurant) => {
        return (restaurant.des.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
      }
    },
    loadAll() {
      return [
        {"value": "'xxx'", "des": "字符串"},
        {"value": "xxx", "des": "数字"},
        {"value": "[xx,xx,xx]", "des": "列表"},
        {"value": "(xxx,xxx,xxx)", "des": "元组"},
        {"value": "{'key1':'value1','key2':value2}", "des": "字典"},
        {"value": "randint(xxx,xxx)", "des": "随机整数(全闭合区间)"},
        {"value": "str_time_s()+'xxx'", "des": "时间戳(字符串) 精确到秒"},
        {"value": "str_time_ms()+'xxx'", "des": "时间戳(字符串) 精确到毫秒"},
        {"value": "str_time_μs()+'xxx'", "des": "时间戳(字符串) 精确到微秒"},
        {"value": "fake.ssn()", "des": "随机身份证"},
        {"value": "fake.address()", "des": "随机地址"},
        {"value": "fake.phone_number()", "des": "随机手机号"},
        {"value": "fake.name()", "des": "随机姓名"},
        {"value": "fake.email()", "des": "随机邮箱"},
        {"value": "data_file(row,0)", "des": "数据文件(行下标,列下标),row为随机"},
      ]
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