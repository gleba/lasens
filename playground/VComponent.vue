<template>
  <div>{{}}</div>
  <span>{{ message }}</span>
</template>

<script>
export default {
  name: 'VComponent',
  data() {
    return {
      message: 'hello!',
      xxx: 'hello!',
    }
  },
  use(f){
    console.helpers("use", f)

  },
  created() {
    this.message = 'bye!'
  },
}
</script>

<style scoped></style>
