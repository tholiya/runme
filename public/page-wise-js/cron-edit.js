$(document).ready(function () {
    if ($('#editCronForm').length > 0) {
        $('#editCronForm').validate({
            rules: {
                name: {
                    required: true
                },
                description: {
                    required: true
                },
                runTime: {
                    required: true,
                    remote: {
                        url: '/crons/validate',
                        type: 'POST',
                        data: {
                            string: function () {
                                var dn = $('[name="runTime"]').val();
                                return dn;
                            }
                        }
                    }
                }
            },
            messages: {
                name: {
                    required: 'Please Enter Name',
                },
                description: {
                    required: 'Please Enter Description'
                },
                runTime: {
                    required: 'Please Enter Cron String',
                    remote: "Please Enter Valid Cron String"
                }
            }
        });
    }
});