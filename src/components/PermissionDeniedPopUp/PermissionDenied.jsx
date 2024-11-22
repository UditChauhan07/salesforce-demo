import Swal from 'sweetalert2';

function PermissionDenied() {
    Swal.fire({
        icon: 'error',
        title: 'Permission Denied',
        text: 'You do not have access to this module',
        confirmButtonText: 'OK',
        confirmButtonColor: '#000'
    });
}

export default PermissionDenied;
