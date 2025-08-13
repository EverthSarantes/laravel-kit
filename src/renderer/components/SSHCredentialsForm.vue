<template>
    <div class="pt-6">
        <h2 class="text-xl font-bold mb-4">Credenciales SSH</h2>
        <form @submit.prevent="saveCredentials">
            <div class="flex flex-col md:flex-row py-1">
                <div class="w-96 my-2">
                    <label class="text-sm text-gray-900 dark:text-white" for="ssh-host">Host</label>
                </div>
                <input type="text" class="form-input input-text my-2" id="ssh-host" v-model="form.host" required />
            </div>
            <div class="flex flex-col md:flex-row py-1">
                <div class="w-96 my-2">
                    <label class="text-sm text-gray-900 dark:text-white" for="ssh-project-path">Ruta del proyecto
                        Laravel</label>
                </div>
                <input type="text" class="form-input input-text my-2" id="ssh-project-path" v-model="form.projectPath"
                    placeholder="/home/usuario/laravel-project" required />
            </div>
            <div class="flex flex-col md:flex-row py-1">
                <div class="w-96 my-2">
                    <label class="text-sm text-gray-900 dark:text-white" for="ssh-port">Puerto</label>
                </div>
                <input type="number" class="form-input input-text my-2" id="ssh-port" v-model.number="form.port" min="1"
                    max="65535" />
            </div>
            <div class="flex flex-col md:flex-row py-1">
                <div class="w-96 my-2">
                    <label class="text-sm text-gray-900 dark:text-white" for="ssh-username">Usuario</label>
                </div>
                <input type="text" class="form-input input-text my-2" id="ssh-username" v-model="form.username"
                    required />
            </div>
            <div class="flex flex-col md:flex-row py-1">
                <div class="w-96 my-2">
                    <label class="text-sm text-gray-900 dark:text-white" for="ssh-password">Contraseña</label>
                </div>
                <input type="password" class="form-input input-text my-2" id="ssh-password" v-model="form.password" />
            </div>
            <div class="flex flex-col md:flex-row py-1">
                <div class="w-96 my-2">
                    <label class="text-sm text-gray-900 dark:text-white" for="ssh-privatekey">Clave privada
                        (opcional)</label>
                </div>
                <textarea class="form-input input-text my-2" id="ssh-privatekey" v-model="form.privateKey" rows="5"
                    placeholder="Pega aquí tu clave privada"></textarea>
            </div>
            <div class="flex flex-col md:flex-row py-1">
                <div class="w-96 my-2">
                    <label class="text-sm text-gray-900 dark:text-white">Tipo de conexión</label>
                </div>
                <label class="inline-flex items-center my-2">
                    <input type="checkbox" v-model="isRemote" @change="emitRemoteChange" />
                    <span class="ml-2">Usar conexión remota (SSH)</span>
                </label>
            </div>

            <div class="flex items-center mt-2">
                <button type="submit"
                    class="bg-blue dark:bg-dark-black hover:bg-blue-100 px-3 pb-1.5 pt-1 text-white text-sm mx-1 focus:outline-none focus:ring-2 dark:bg-purple rounded-md mt-2">Guardar
                    credenciales</button>
                <button type="button" @click="testSSH"
                    class="bg-blue dark:bg-dark-black hover:bg-blue-100 px-3 pb-1.5 pt-1 text-white text-sm mx-1 focus:outline-none focus:ring-2 dark:bg-purple rounded-md mt-2">Probar
                    conexión</button>
                <transition name="fade">
                    <span class="flex flex-row items-center ml-4 text-green-600" v-if="saved">
                        <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        ¡Credenciales guardadas!
                    </span>
                </transition>
            </div>
        </form>
        <div v-if="saved" class="mt-4 text-green-600">¡Credenciales guardadas!</div>
        <div v-if="testResult" :class="{ 'text-green-600': testResult.success, 'text-red-600': !testResult.success }"
            class="mt-4">
            <span v-if="testResult.success">Conexión exitosa: {{ testResult.message }}</span>
            <span v-else>Conexión fallida: {{ testResult.message }}</span>
        </div>
    </div>
</template>

<script>
import { mapMutations, mapState } from "vuex";
export default {
    name: 'SSHCredentialsForm',
    data() {
        return {
            form: {
                host: '',
                port: 22,
                username: '',
                password: '',
                privateKey: '',
                projectPath: '',
            },
            isRemote: false,
            saved: false,
            testResult: null,
            errors: {},
        };
    },
    computed: {
        ...mapState(["sshCredentials", "isRemote"]),
    },
    mounted() {
        // Cargar credenciales guardadas del store
        if (this.sshCredentials) {
            this.form = { ...this.sshCredentials };
        }
        if (typeof this.isRemote === 'boolean') {
            this.isRemote = this.isRemote;
        }
    },
    methods: {
        ...mapMutations(["setSshCredentials", "setIsRemote"]),
        emitRemoteChange() {
            this.setIsRemote(this.isRemote);
            this.$emit('remote-change', this.isRemote);
        },
        validateForm() {
            this.errors = {};
            if (!this.form.host) this.errors.host = 'Host requerido';
            if (!this.form.port) this.errors.port = 'Puerto requerido';
            if (!this.form.username) this.errors.username = 'Usuario requerido';
            if (!this.form.projectPath) this.errors.projectPath = 'Ruta del proyecto requerida';
            return Object.keys(this.errors).length === 0;
        },
        saveCredentials() {
            if (!this.validateForm()) {
                return;
            }
            this.setSshCredentials({ ...this.form });
            this.setIsRemote(this.isRemote);
            this.saved = true;
            setTimeout(() => (this.saved = false), 2000);
        },
        async testSSH() {
            this.testResult = null;
            if (!this.validateForm()) {
                this.testResult = { success: false, message: 'Completa todos los campos obligatorios.' };
                return;
            }
            try {
                const command = `cd ${this.form.projectPath} && php artisan inspire`;
                const result = await window.kit.runSSHCommand({
                    host: this.form.host,
                    port: this.form.port,
                    username: this.form.username,
                    password: this.form.password,
                    privateKey: this.form.privateKey,
                }, command);
                if (result && result.stdout) {
                    this.testResult = { success: true, message: result.stdout };
                } else {
                    this.testResult = { success: false, message: result.stderr || 'Sin respuesta del servidor.' };
                }
            } catch (err) {
                this.testResult = { success: false, message: err.message || String(err) };
            }
        },
    },
};
</script>

<style scoped>
.input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}
</style>
