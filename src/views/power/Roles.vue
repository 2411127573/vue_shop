<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色 -->
      <el-button type="primary">添加用户</el-button>
      <!-- 用户列表区域 -->
      <el-table :data="rolesList" border :stripe="true">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) of scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  @close="removeRolesById(scope.row, item3.id)"
                  closable
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二、三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) of item1.children"
                  :key="item2.id"
                >
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      @close="removeRolesById(scope.row, item3.id)"
                      closable
                      type="success"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      @close="removeRolesById(scope.row, item3.id)"
                      closable
                      v-for="item3 of item2.children"
                      :key="item3.id"
                      type="warning"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 编辑 -->
            <el-button type="primary" size="mini" icon="el-icon-edit"
              >编辑</el-button
            >
            <!-- 删除 -->
            <el-button type="danger" size="mini" icon="el-icon-delete"
              >删除</el-button
            >
            <!-- 分配权限 -->
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setDialogVisible"
      width="50%"
      @close="setDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 用户角色列表
      rolesList: [],
      // 用户权限列表
      rightsList: [],
      // 影藏分配权限对话框
      setDialogVisible: false,
      // 树形控件属性绑定对象
      treeProps: {
        label: "authName",
        children: "children",
      },
      // 默认选中的节点id
      defkeys: [],
      // 当前角色的id
      roleId: "",
    };
  },
  mounted() {
    this.getRolesList();
  },
  methods: {
    // 获取用户角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      // console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error("获取角色列表失败");
      } else {
        // this.$message.error("获取角色列表失败");
        this.rolesList = res.data;
      }
    },
    // 根据id删除对应的权限
    async removeRolesById(role, rightId) {
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
        this.$message.success("已确认删除");
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        );
        if (res.meta.status !== 200) {
          this.$message.error("取消权限失败");
        } else {
          // this.getRolesList();
          role.children = res.data;
        }
      }
    },
    // 分配角色对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      // console.log(res);
      if (res.meta.status !== 200) {
        this.$message.error("获取权限列表失败");
      } else {
        // this.$message.error(res.meta.msg);
        this.rightsList = res.data;
        console.log(this.rightsList);
      }
      // 通过递归获取三级权限的id
      this.getLeafkeys(role, this.defkeys);
      this.setDialogVisible = true;
    },
    // 通过递归的形式获得三级权限的id
    getLeafkeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }

      node.children.forEach((item) => {
        this.getLeafkeys(item, arr);
      });
    },
    // 关闭对话框时重置选中的节点
    setDialogClosed() {
      this.defkeys = [];
    },
    // 为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      const idStr = keys.join(",");
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        this.$message.error("角色授权失败");
      } else {
        // this.$message.error(res.meta.msg);
        this.getRolesList();
      }
      this.setDialogVisible = false;
    },
  },
};
</script>
<style lang="less" scoped>
.vcenter {
  display: flex;
  align-items: center;
}
</style>
