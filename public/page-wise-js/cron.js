$(document).ready(function () {
    socketFun.receiveCronStatusEvent();
    if ($('.pause-cron').length > 0) {
        $('.pause-cron').on('click', function () {
            let id = $(this).data('id');
            let pauseStatus = !$(this).prop('checked');
            Swal.fire({
                title: 'Are you sure?',
                text: "You wont to "+(pauseStatus ? 'pause' : 'start'),
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes change it!',
                confirmButtonClass: 'btn btn-danger',
                cancelButtonClass: 'btn btn-primary ml-1',
                buttonsStyling: true,
            }).then(function (result) {
                if (result.value) {
                    $.ajax({
                        url: '/crons/play-pause',
                        type: 'POST',
                        dataType: 'JSON',
                        data: {
                            id: id,
                            status:pauseStatus
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
        });
    }

    $('.pause-play-all').on('click', function () {
        let pauseStatus = $(this).data('id')
        Swal.fire({
            title: 'Are you sure?',
            text: "You wont to "+(pauseStatus ? 'pause' : 'start')+" all cron",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes change it!',
            confirmButtonClass: 'btn btn-danger',
            cancelButtonClass: 'btn btn-primary ml-1',
            buttonsStyling: true,
        }).then(function (result) {
            if (result.value) {
                $.ajax({
                    url: '/crons/play-pause-all',
                    type: 'POST',
                    dataType: 'JSON',
                    data: {
                        status:pauseStatus
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
    });

    $('#sync-cron').on('click', function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "You wont to sync cron",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes sync it!',
            confirmButtonClass: 'btn btn-danger',
            cancelButtonClass: 'btn btn-primary ml-1',
            buttonsStyling: true,
        }).then(function (result) {
            if (result.value) {
                $.ajax({
                    url: '/crons/sync-cron',
                    type: 'POST',
                    dataType: 'JSON',
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
    });

})