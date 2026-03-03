import { AdminRequestsClient } from '../requests/AdminRequestsClient';
import StaffManagementClient from './StaffManagementClient';

export default function StaffPage() {
    return (
        <AdminRequestsClient title="Управление персоналом">
            <StaffManagementClient />
        </AdminRequestsClient>
    );
}
