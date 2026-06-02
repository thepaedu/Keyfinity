<template>
  <router-view />
</template>

<script>
export default {
  path: '/',
  redirect: async () => {
    const stored = localStorage.getItem('keychain_code')
    if (stored) return `/${stored}`

    const data = await createKeychain()
    localStorage.setItem('keychain_code', data.code)
    return `/${data.code}`
  }
};
</script>