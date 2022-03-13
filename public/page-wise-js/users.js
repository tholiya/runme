$(document).ready(function () {
    if ($('#addUserForm').length > 0) {
        $.validator.addMethod("passwordFormatCheck", function (value, element) {
            return this.optional(element) || /^(?=.*\d)(?=.*[A-Z])(?=.*\W).*$/i.test(value);
        }, 'Password must contain one capital letter,one numerical and one special character');
        $('#addUserForm').validate({
            rules: {
                name: {
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                phone: {
                    required: true,
                    number: true,
                    minlength: 10,
                    maxlength: 10
                },
                roleId: {
                    required: true
                },
                password: {
                    required: true,
                    minlength: 6,
                    maxlength: 15,
                    passwordFormatCheck: true
                },
                conform_password: {
                    required: true,
                    equalTo: '#basic-default-password'
                }
            },
            messages: {
                name: {
                    required: 'Please enter Name',
                },
                email: {
                    required: 'Please enter Email',
                    email: 'Please enter Valid Email'
                },
                phone: {
                    required: 'Please enter Mobile Number',
                    number: 'Please enter only number',
                    minlength: 'Mobile Number must be equal to 10 digits',
                    maxlength: 'Mobile Number must be equal to 10 digits'
                },
                roleId: {
                    required: 'Please select Role',
                },
                password: {
                    required: 'Please enter password',
                    minlength: 'Please enter minimum 5 character password',
                    maxlength: 'You can enter maximum 15 character password',
                    passwordFormatCheck: true
                },
                conform_password: {
                    required: 'Please enter confirm password',
                    equalTo: 'Conform Password must be as same as password'
                }
            }
        });
    }
    if ($('#changePassword').length > 0) {
        $('#changePassword').validate({
            rules: {
                current_password: {
                    required: true,
                },
                password: {
                    required: true,
                    minlength: 6,
                    maxlength: 15,
                    passwordFormatCheck: true
                },
                conform_password: {
                    required: true,
                    equalTo: '#basic-default-password'
                }
            },
            messages: {
                current_password: {
                    required: 'Please enter current password',
                },
                password: {
                    required: 'Please enter password',
                    minlength: 'Please enter minimum 5 character password',
                    maxlength: 'You can enter maximum 15 character password',
                    passwordFormatCheck: true
                },
                conform_password: {
                    required: 'Please enter confirm password',
                    equalTo: 'Conform Password must be as same as password'
                }
            }
        });
    }

    if ($('.delete-user').length > 0) {
        $('.delete-user').on('click', function () {
            let deleteId = $(this).data('id');
            Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes delete it!',
                confirmButtonClass: 'btn btn-danger',
                cancelButtonClass: 'btn btn-primary ml-1',
                buttonsStyling: false,
            }).then(function (result) {
                if (result.value) {
                    $.ajax({
                        url: '/users/delete',
                        type: 'POST',
                        dataType: 'JSON',
                        data: {
                            deleteId: deleteId
                        },
                        success: function (response) {
                            Swal.fire(
                                {
                                    icon: response.type,
                                    title: 'Deleted Response!',
                                    text: response.message,
                                    timer: 2500
                                }
                            ).then((result) => {
                                window.location.href = window.location.href;
                            })
                        }
                    })

                }
            })
            return false;
        })
    }

    if ($('.change-status').length > 0) {
        $('.change-status').on('click', function () {
            let statusId = $(this).data('id');
            let status = $(this).data('status');
            Swal.fire({
                title: 'Are you sure?',
                text: "You wont to change status!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes change it!',
                confirmButtonClass: 'btn btn-danger',
                cancelButtonClass: 'btn btn-primary ml-1',
                buttonsStyling: false,
            }).then(function (result) {
                if (result.value) {
                    $.ajax({
                        url: '/users/change-status',
                        type: 'POST',
                        dataType: 'JSON',
                        data: {
                            statusId: statusId,
                            status:status
                        },
                        success: function (response) {
                            Swal.fire(
                                {
                                    icon: response.type,
                                    title: 'Status Response!',
                                    text: response.message,
                                    timer: 2500
                                }
                            ).then((result) => {
                                window.location.href = window.location.href;
                            })
                        }
                    })

                }
            })
            return false;
        })
    }

})