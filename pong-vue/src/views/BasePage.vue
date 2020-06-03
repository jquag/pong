<template>
    <div class="page">
        <div v-bind:class="['top-section', {padded: !noPadding}]"><slot name="top"></slot></div>
        <div v-bind:class="['main-section', {padded: !noPadding}]">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    name: 'BasePage',
    props: {
        noPadding: Boolean
    }
}
</script>

<style scoped>
    .main-section.padded, .top-section.padded {
        padding: 5px 1rem;
    }

    .top-section {
        border-bottom: 4px solid var(--color-gray);
    }
</style>