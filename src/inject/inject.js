/**
 * @author Kevin Bohinski <bohinsk1@tcnj.edu>
 * @version 1.0
 * @since 2015-12-14
 *
 * Project Name:  Avgr
 * Description:   Calculates class averages for classes on canvas.
 *
 * Filename:      inject/inject.js
 * Description:   JS Injection that calculates class average and displays it.
 * Last Modified: 2015-12-14
 *
 * Copyright (c) 2015 Kevin Bohinski. All rights reserved.
 */

chrome.extension.sendMessage({}, function (response) {
    var readyStateCheckInterval = setInterval(function () {
        if (document.readyState === "complete") {
            clearInterval(readyStateCheckInterval);

            if (document.URL.search("grades") != -1) {
                var right = document.getElementById("right-side");
                var grades = document.getElementsByClassName("score_details_table");
                var postedGrades = document.getElementsByClassName("grade");
                var maxs = document.getElementsByClassName("possible");

                var avgs = [];
                var posteds = []
                var outOfs = [];

                for (i = 0; i < postedGrades.length; i++) {
                    var html = postedGrades[i].innerText;
                    var tmp = html.split(" ");
                    var n = tmp[6];
                    if (isNaN(n)) {
                        posteds.push("false");
                    } else {
                        posteds.push("true");
                    }
                }

                /* i = 1 to skip the first table header */
                for (i = 1; i < (maxs.length - 1); i++) {
                    var html = maxs[i].innerHTML;
                    if (html.search("Final") == -1) {
                        outOfs.push(parseFloat(html.trim()));
                    }
                }

                for (i = 0; i < grades.length; i++) {
                    var html = grades[i].innerHTML;
                    var tmp = html.split("data-aria=\"");
                    tmp = tmp[1].split("_");
                    if (tmp[0] == "comments") {
                        /* Canvas Comments */
                        continue;
                    } else {
                        /* Canvas Grades */
                        tmp = html.split("<td>");
                        tmp = tmp[1].split("<");
                        tmp = tmp[0].split(":");
                        avgs.push(parseFloat(tmp[1].trim()));
                    }
                }

                var avgSum = 0;
                for (i = 0; i < avgs.length; i++) {
                    avgSum += avgs[i];
                }

                var outOfSum = 0;
                for (i = 0; i < outOfs.length; i++) {
                    if (posteds[i] == "true") {
                        outOfSum += outOfs[i];
                    }
                }

                var avg = avgSum / outOfSum;
                avg *= 100;

                right.innerHTML = "<p class=\"student_assignment final_grade\" style=\"font-size: 1.2em;\">Class Average: " + avg.toFixed(2) + "%</p>" + right.innerHTML;
            }

        }
    }, 10);
});
