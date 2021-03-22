<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button> </el-input
        ></el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userList" border :stripe="true">
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="username" label="姓名"> </el-table-column>
        <el-table-column prop="email" label="邮箱"> </el-table-column>
        <el-table-column prop="mobile" label="电话"> </el-table-column>
        <el-table-column prop="role_name" label="角色"> </el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scrope">
            <el-switch
              v-model="scrope.row.mg_state"
              @change="usersStateChanged(scrope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 分配 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                size="mini"
                icon="el-icon-setting"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页功能区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 3, 5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 对话框区域 -->
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClose"
    >
      <!-- 对话框主体区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClose"
    >
      <!-- 主体区域 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 邮箱验证规则
    var checEmail = (rule, value, callback) => {
      //  邮箱正则表达式
      const regEmail = /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/;
      if (regEmail.test(value)) {
        callback();
      } else {
        callback(new Error("请输入合法的邮箱"));
      }
    };
    // 手机验证规则
    var checMobile = (rule, value, callback) => {
      // 手机正则表达式
      const regMobile = /^1(?:3\d|4[4-9]|5[0-35-9]|6[67]|7[013-8]|8\d|9\d)\d{8}$/;
      if (regMobile.test(value)) {
        callback();
      } else {
        callback(new Error("请输入合法的手机号"));
      }
    };
    return {
      // 请求参数对象
      queryInfo: {
        // 查询参数
        query: "",
        // 当前页码
        pagenum: 1,
        // 每页显示多少条
        pagesize: 2,
      },
      //用户数据列表
      userList: [],
      // 总记录数
      total: 0,
      // 添加用户对话框的显示以及隐藏
      addDialogVisible: false,
      // 修改用户对话框的显示以及隐藏
      editDialogVisible: false,
      // 添加用户表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: "",
      },
      // 添加用户的表单验证规则
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "长度在 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "请输入用户密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "长度在 6 到 15 个字符",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            validator: checEmail,
            trigger: "blur",
          },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          {
            validator: checMobile,
            trigger: "blur",
          },
        ],
      },
      // 修改用户的表单验证规则
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            validator: checEmail,
            trigger: "blur",
          },
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          {
            validator: checMobile,
            trigger: "blur",
          },
        ],
      },
      // 修改用户的获取数据对象
      editForm: {},
    };
  },
  created() {},
  mounted() {
    this.getUserList();
  },
  methods: {
    // 点击按钮查询用户列表数据
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });

      if (res.meta.status !== 200) {
        this.$message.error("获取用户列表失败");
      } else {
        // this.$message.success(res.meta.msg);
        this.userList = res.data.users;
        this.total = res.data.total;
      }

      // console.log(res);
    },
    // 监听每页数量
    handleSizeChange(newSize) {
      // console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    // 监听当前页码
    handleCurrentChange(newPage) {
      // console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听状态开关
    async usersStateChanged(userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userInfo.mg_state != userInfo.mg_state;
        this.$message.error("设置状态失败");
      } else {
        this.$message.success(res.meta.msg);
      }
    },
    // 对话框关闭事件
    addDialogClose() {
      // 重置表单
      this.$refs.addFormRef.resetFields();
    },
    // 对话框确认验证表单添加成功
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        } else {
          const { data: res } = await this.$http.post("users", this.addForm);
          console.log(res);
          if (res.meta.status !== 201) {
            this.$message.error("用户创建失败");
          } else {
            this.$message.success(res.meta.msg);
            // 隐藏对话框
            this.addDialogVisible = false;
            // 重新获取用户列表数据
            this.getUserList();
          }
        }
      });
    },
    // 修改对话框
    async showEditDialog(id) {
      this.editDialogVisible = true;
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        this.$message.error("查询失败");
      } else {
        this.editForm = res.data;
        this.$message.success(res.meta.msg);
      }
    },
    // 修改对话框关闭重置
    editDialogClose() {
      this.$refs.editFormRef.resetFields();
    },
    // 点击按钮确认修改用户

    editUser() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        } else {
          const { data: res } = await this.$http.put(
            "users/" + this.editForm.id,
            { email: this.editForm.email, mobile: this.editForm.mobile }
          );
          console.log(res);
          if (res.meta.status !== 200) {
            this.$message.error("修改失败");
          } else {
            this.$message.success(res.meta.msg);
            this.editDialogVisible = false;
            this.getUserList();
          }
        }
      });
    },
    // 点击删除按钮弹框确认
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => err);
      //console.log(confirmResult);
      // 点击取消获的cancel字符串
      // 点击确认获的cconfirm字符串info
      if (confirmResult !== "confirm") {
        this.$message.info("已取消删除");
      } else {
        this.$message.info("已确认删除");
        const { data: res } = await this.$http.delete("users/" + id);
        // console.log(res);
        if (res.meta.status !== 200) {
          this.$message.error("删除失败");
        } else {
          this.$message.success(res.meta.msg);
          this.getUserList();
        }
      }
    },
  },
};
</script>
<style lang="less" scoped></style>
