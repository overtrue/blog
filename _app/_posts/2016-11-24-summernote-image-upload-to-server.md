---
layout: post
title: Summernote 图片上传到服务端实现方式
excerpt: Summernote 默认使用 data-url 形式来存储编辑器内的图片，本文介绍如何改为上传到服务器返回 url 形式。
---

Summernote 默认使用 data-url 形式来存储编辑器内的图片，稍大一些的图片生成的 [data URIs](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/data_URIs) 就会特别长特别长，几度让我的 chrome 出现：`net::ERR_INCOMPLETE_CHUNKED_ENCODING` 的报错。

为了将其改为上传到服务器端然后插入 `img` 标签的形式，我们需要做一些小小的自定义，下面的一段简单的代码即可达到此目的：

```js
jQuery(document).ready(function($) {
    //upload image in description
    $('#description').summernote({
        height: 300,
        callbacks: {
            onImageUpload: function(files, editor, welEditable) {
                    for (var i = files.length - 1; i >= 0; i--) {
                        sendFile(files[i], this);
                    }
                }
        }});

    //create record for attachment
    function sendFile(file, el) {
        data = new FormData();
        data.append("file", file); // 表单名称

        $.ajax({
            type: "POST",
            url: "这里填写你的服务器端上传 URL",
            data: data,
            cache: false,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function(response) {
              // 这里可能要根据你的服务端返回的上传结果做一些修改哦
              $(el).summernote('editor.insertImage', response.url, response.filename);
            },
            error : function(error) {
              alert('图片上传失败');
            },
            complete : function(response) {
            }
        });
    }
});
```
