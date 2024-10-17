<template>
    <div class="regular-background">
        <!-- Toast -->
        <Toast class="z-50" />

        <!-- Tabs Panel -->
        <div class="bg-white w-11/12 max-w-5xl rounded-xl shadow-lg pt-4 pb-5 px-4 mt-32 mb-28">
            <Tabs v-model:activeItem="activeTab" class="text-primaryText" value="0">
                <TabList class="flex border-b-2 justify-start">
                    <Tab value="0"
                        :class="activeTab === 0 ? 'px-2 py-2 w-auto border-b-2 border-black' : 'px-2 py-2 w-auto border-b-2 border-transparent hover:!border-black'"
                        @click="activeTab = 0">
                        <i class="pi pi-users mr-2"></i>
                        <span>All Users</span>
                    </Tab>
                    <Tab value="1"
                        :class="activeTab === 1 ? 'px-2 py-2 w-auto border-b-2 border-black' : 'px-2 py-2 w-auto border-b-2 border-transparent hover:!border-black'"
                        @click="activeTab = 1">
                        <i class="pi pi-file-check mr-2"></i>
                        <span>Verify</span>
                    </Tab>
                    <Tab value="2"
                        :class="activeTab === 2 ? 'px-2 py-2 w-auto border-b-2 border-black' : 'px-2 py-2 w-auto border-b-2 border-transparent hover:!border-black'"
                        @click="activeTab = 2">
                        <i class="pi pi-file mr-2"></i>
                        <span>Reports</span>
                    </Tab>
                    <Tab value="3"
                        :class="activeTab === 3 ? 'px-2 py-2 w-auto border-b-2 border-black' : 'px-2 py-2 w-auto border-b-2 border-transparent hover:!border-black'"
                        @click="activeTab = 3">
                        <i class="pi pi-check-square mr-2"></i>
                        <span>Unverified Uploads</span>
                    </Tab>
                </TabList>

                <TabPanels>
                    <!-- All Users-->
                    <TabPanel value="0" class="pt-5">
                        <div class="flex items-center space-x-8">
                            <!-- Verified Toggle -->
                            <div class="flex items-center">
                                <span class="mr-4">Verified</span>
                                <ToggleSwitch v-model="verifiedToggle" :disabled="!selectedUser"
                                    @change="onToggleVerified" />
                            </div>
                            <!-- Admin Toggle -->
                            <div class="flex items-center">
                                <span class="mr-4">Admin</span>
                                <ToggleSwitch v-model="toggleValue" :disabled="!selectedUser" @change="onToggleAdmin" />
                            </div>
                        </div>
                    </TabPanel>

                    <!-- Verify Panel -->
                    <TabPanel value="1" class="pt-5">
                        <div class="flex items-start space-x-8">
                            <div v-if="selectedUser && selectedUser.id_file">
                                <!-- Display the user's ID image -->
                                <Image :src="`http://localhost:8000/${selectedUser.id_file}`" alt="User ID Image"
                                    width="100" preview />
                            </div>
                            <div v-else>
                                <!-- Placeholder when no user is selected or user has no ID file -->
                                <p class="!text-gray-600">Select a user to view their ID image.</p>
                            </div>

                            <div class="flex items-center space-x-4">
                                <span class="mr-4">Verify</span>
                                <!-- ToggleSwitch for Verified status -->
                                <ToggleSwitch v-model="verifyIdToggle" @change="onToggleIdVerified"
                                    :disabled="!selectedUser || !selectedUser.id_file || activeTab !== 1" />
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel value="2" class="pt-5">
                        <div class="flex items-center space-x-6">
                            <!-- Generate Report Button -->
                            <Button label="Generate Report" icon="pi pi-download"
                                class="text-white bg-primaryText p-button-rounded hover:shadow-sm transform transition-transform hover:scale-102 active:scale-100"
                                @click="generateReport" :disabled="!selectedUser" />

                            <!-- Radio Buttons for File Format -->
                            <div class="flex flex-wrap gap-4">
                                <div class="flex items-center">
                                    <RadioButton :disabled="!selectedUser" v-model="selectedFormat" inputId="format1"
                                        name="format" value="PDF" />
                                    <label for="format1" class="ml-2">PDF</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton :disabled="!selectedUser" v-model="selectedFormat" inputId="format2"
                                        name="format" value="CSV" />
                                    <label for="format2" class="ml-2">CSV</label>
                                </div>
                                <div class="flex items-center">
                                    <RadioButton :disabled="!selectedUser" v-model="selectedFormat" inputId="format3"
                                        name="format" value="JSON" />
                                    <label for="format3" class="ml-2">JSON</label>
                                </div>
                            </div>
                        </div>
                    </TabPanel>
                    <!-- Unverified Uploads Tab -->
                    <TabPanel value="3" class="pt-5">
                        <DataTable :value="unverifiedUploads" :loading="loadingUploads">
                            <Column field="file_name" header="File Name"></Column>
                            <Column field="upload_date" header="Upload Date">
                                <template #body="slotProps">
                                    {{ new Date(slotProps.data.upload_date).toLocaleString() }}
                                </template>
                            </Column>
                            <Column field="file_type" header="File Type"></Column>
                            <Column header="Action">
                                <template #body="slotProps">
                                    <Button label="Verify" icon="pi pi-check" @click="verifyUpload(slotProps.data.id)"
                                        class="p-button-sm" />
                                </template>
                            </Column>
                        </DataTable>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <!-- Search Bar -->
            <div class="flex justify-end mb-2">
                <IconField :hidden="activeTab === 3">
                    <InputText v-model="filters['global'].value" placeholder="Keyword Search" />
                    <InputIcon>
                        <i class="pi pi-search" />
                    </InputIcon>
                </IconField>
            </div>

            <!-- PrimeVue DataTable -->
            <DataTable v-if="!loading" :value="filteredUsers" selectionMode="single" v-model:selection="selectedUser"
                @rowSelect="onRowSelect" paginator :rows="10" :filters="filters" :hidden="activeTab === 3"
                :globalFilterFields="['name', 'email', 'verified', 'admin']">
                <template #empty> No users found. </template>

                <!-- Name Column -->
                <Column field="name" header="Name" style="width: 20%" />

                <!-- Email Column -->
                <Column field="email" header="Email" style="width: 50%" />

                <!-- Verified Column -->
                <Column field="verified" header="Verified" style="width: 15%">
                    <template #body="{ data }">
                        <i class="pi"
                            :class="{ 'pi-check-circle !text-green-500': data.verified, 'pi-times-circle !text-red-400': !data.verified }"></i>
                    </template>
                </Column>

                <!-- Admin Column -->
                <Column field="admin" header="Admin" style="width: 15%">
                    <template #body="{ data }">
                        <i class="pi"
                            :class="{ 'pi-check-circle !text-green-500': data.admin, 'pi-times-circle !text-red-400': !data.admin }"></i>
                    </template>
                </Column>
            </DataTable>

            <!-- Skeleton while data is loading -->
            <DataTable v-else :value="[{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]" paginator :rows="10">
                <!-- Name Column -->
                <Column header="Name" style="width: 20%">
                    <template #body>
                        <Skeleton width="100%" height="1.5rem" />
                    </template>
                </Column>

                <!-- Email Column -->
                <Column header="Email" style="width: 50%">
                    <template #body>
                        <Skeleton width="100%" height="1.5rem" />
                    </template>
                </Column>

                <!-- Verified Column -->
                <Column header="Verified" style="width: 15%">
                    <template #body>
                        <Skeleton width="100%" height="1.5rem" />
                    </template>
                </Column>

                <!-- Admin Column -->
                <Column header="Admin" style="width: 15%">
                    <template #body>
                        <Skeleton width="100%" height="1.5rem" />
                    </template>
                </Column>
            </DataTable>

        </div>
    </div>
</template>

<script>
import { defineComponent, ref, onMounted, watch } from 'vue';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import TabPanels from 'primevue/tabpanels';
import TabPanel from 'primevue/tabpanel';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode } from '@primevue/core/api';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import { useToast } from 'primevue/usetoast';
import Toast from 'primevue/toast';
import apiClient from '@/services/api';
import ToggleSwitch from 'primevue/toggleswitch';
import Image from 'primevue/image';
import Button from 'primevue/button';
import RadioButton from 'primevue/radiobutton';
import Skeleton from 'primevue/skeleton';

export default defineComponent({
    name: 'AdminPage',
    components: {
        Tabs,
        TabList,
        Tab,
        TabPanel,
        TabPanels,
        DataTable,
        Column,
        InputText,
        InputIcon,
        IconField,
        Toast,
        ToggleSwitch,
        Image,
        Button,
        RadioButton,
        Skeleton
    },
    setup() {
        const toast = useToast();
        const activeTab = ref(0);
        const users = ref([]);
        const filteredUsers = ref([]);
        const selectedUser = ref(null);
        const loading = ref(true);
        const toggleValue = ref(false);
        const verifiedToggle = ref(false);
        const verifyIdToggle = ref(false);
        const unverifiedUploads = ref([]);
        const loadingUploads = ref(false);
        const selectedFormat = ref("PDF");

        // Initialize filters properly
        const filters = ref({
            global: { value: null, matchMode: FilterMatchMode.CONTAINS }
        });

        const fetchUserData = async () => {
            try {
                const response = await apiClient.getUsers('/user-data');
                users.value = response.data.users;
                filteredUsers.value = users.value;
                loading.value = false;
                toast.add({ severity: 'info', summary: 'Success', detail: 'User data loaded successfully!', life: 3000 });
            } catch (error) {
                console.error('Error fetching user data:', error);
                loading.value = false;
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch user information.', life: 3000 });
            }
        };

        const filterUsersForVerify = () => {
            filteredUsers.value = users.value.filter(user => user.id_file !== null);
        };

        watch(activeTab, (newValue) => {
            if (newValue === 1) {
                filterUsersForVerify();
            } else if (newValue === 3) {
                fetchUnverifiedUploads();
            } else {
                filteredUsers.value = users.value;
            }
        });

        onMounted(() => {
            fetchUserData();
        });

        const onRowSelect = (event) => {
            toggleValue.value = event.data.admin;
            verifiedToggle.value = event.data.verified;
            verifyIdToggle.value = event.data.verified;
        };

        // Handle Admin toggle
        const onToggleAdmin = async () => {
            if (selectedUser.value) {
                selectedUser.value.admin = toggleValue.value; // Update local user object
                try {
                    await apiClient.updateAdminStatus(selectedUser.value.id, toggleValue.value);
                    toast.add({ severity: 'success', summary: 'Success', detail: `Admin status updated: ${toggleValue.value}`, life: 3000 });
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update admin status.', life: 3000 });
                }
            }
        };

        // Handle Verified toggle
        const onToggleVerified = async () => {
            if (selectedUser.value) {
                selectedUser.value.verified = verifiedToggle.value; // Update local user object
                try {
                    await apiClient.updateVerifiedStatus(selectedUser.value.id, verifiedToggle.value);
                    toast.add({ severity: 'success', summary: 'Success', detail: `Verified status updated: ${verifiedToggle.value}`, life: 3000 });
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update verified status.', life: 3000 });
                }
            }
        };

        // Handle Verified toggle
        const onToggleIdVerified = async () => {
            if (selectedUser.value) {
                selectedUser.value.verified = verifyIdToggle.value; // Update local user object
                try {
                    await apiClient.updateVerifiedStatus(selectedUser.value.id, verifyIdToggle.value);
                    toast.add({ severity: 'success', summary: 'Success', detail: `Verified status updated: ${verifyIdToggle.value}`, life: 3000 });
                    if (verifyIdToggle.value) {
                        await apiClient.sendVerifiedEmail(selectedUser.value.id);
                        toast.add({ severity: 'info', summary: 'User Notified', detail: 'User verified and email sent successfully!', life: 3000 });
                    }
                } catch (error) {
                    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update verified status.', life: 3000 });
                }
            }
        };
        const fetchUnverifiedUploads = async () => {
            loadingUploads.value = true;
            try {
                const response = await apiClient.getUnverifiedUploads();
                unverifiedUploads.value = response.data;
            } catch (error) {
                console.error('Error fetching unverified uploads:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch unverified uploads.', life: 3000 });
            } finally {
                loadingUploads.value = false;
            }
        };

        const verifyUpload = async (uploadId) => {
            try {
                await apiClient.verifyUpload(uploadId);
                toast.add({ severity: 'success', summary: 'Success', detail: 'Upload verified successfully!', life: 3000 });
                unverifiedUploads.value = unverifiedUploads.value.filter(upload => upload.id !== uploadId);
            } catch (error) {
                console.error('Error verifying upload:', error);
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to verify upload.', life: 3000 });
            }
        };


        const generateReport = async () => {
            const data = {
                userId: selectedUser.value.id,
                reportFormat : selectedFormat.value,
                admin: toggleValue.value
            };

            try {
                // API call or logic to generate report based on selectedFormat
                const response = await apiClient.getUserReport(data);

                if (selectedFormat.value === 'CSV') {
                    // Create a download link
                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'report.csv');

                    // Append the link to the document and trigger a click to start the download
                    document.body.appendChild(link);
                    link.click();
                    
                    // Clean up
                    document.body.removeChild(link);
                    link.remove()
                    window.URL.revokeObjectURL(url);
                } else {
                    // Create a download link
                    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', 'report.pdf'); 

                    // Append the link to the document and trigger a click to start the download
                    document.body.appendChild(link);
                    link.click();

                    // Clean up
                    document.body.removeChild(link);
                    link.remove();
                    window.URL.revokeObjectURL(url);
                }

                // You can replace this with your actual API logic
                toast.add({ severity: 'success', summary: 'Report', detail: `Generated ${selectedFormat.value} report successfully!`, life: 3000 });
            } catch (error) {
                toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to generate report.', life: 3000 });
            }
        };

        return {
                activeTab,
                users,
                filters,
                loading,
                selectedUser,
                onRowSelect,
                toggleValue,
                onToggleAdmin,
                verifiedToggle,
                onToggleVerified,
                filteredUsers,
                verifyIdToggle,
                selectedFormat,
                generateReport,
                onToggleIdVerified,
                unverifiedUploads,
                loadingUploads,
                verifyUpload,
            };  
    } 
    });
    </script>

<style scoped>
.p-inputtext {
    width: 100%;
    padding: 8px;
    border: 1px solid #DED2D9 !important;
    border-radius: 0.6rem !important;
    outline: none;
    font-size: 14px;
}
</style>
