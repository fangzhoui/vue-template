<template>
  <div class="about">
    <h1 class="h1bg">This is an about page</h1>
    <el-button type="danger">1111</el-button>
    <div class="box">
      <div>{{$txt}}</div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'about',
  data () {
    return {
      $txt: {}
    }
  },
  created () {
    this.$txt = { n: 1 };
    let n = 2;
    Object.defineProperty(this.$txt, "n", {
      get() {
        return n;
      },
      set(val) {
        return (n = val);
      }
    });
  },
  mounted(){
    console.log(this.$txt) // {n:2}  但是, span标签里面的值不会变
  }
}
</script>
<style lang="less" scoped>
  .h1bg {
    background: @bgColor;
  }
</style>