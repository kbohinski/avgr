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

            /* If they are on a grade page, then do work */
            if (document.URL.search("grades") != -1) {
                var right = document.getElementById("right-side");
                var categorys = document.getElementsByClassName("group_total");
                var assignments = document.getElementsByClassName("assignment_graded");

                /* Because JS dosent have maps.... */
                var groupWeights = [];
                var groupNames = [];
                var groupTotals = [];
                var groups = [];
                var maxs = [];
                var avgs = [];

                /* Get assignment groups and group weights */
                for (i = 0; i < categorys.length; i++) {
                    var html = categorys[i].innerHTML;
                    var tmp = html.split(">");
                    var name = tmp[1];
                    name = name.split("<");
                    name = name[0].trim();
                    tmp = html.split("weight\">");
                    tmp = tmp[1].split("<");
                    var weight = parseFloat(tmp[0].trim());
                    weight /= 100;
                    groupNames.push(name);
                    groupWeights.push(weight);
                }

                /* Get assignment info */
                /*
                 * tables are:
                 * -Submission
                 * -Grade Info
                 * -Comments (Can ignore)
                 * -Rubric (Can ignore)
                 */
                for (i = 0; i < assignments.length; i += 4) {
                    /* Get HTML */
                    var gradeHtml = assignments[i].innerHTML;
                    var infoHtml = assignments[i + 1].innerHTML;

                    /* Elements needed from gradeHtml */
                    var max = 0;
                    var group = "";

                    /* Elements needed from infoHtml */
                    var avg = 0;

                    tmp = gradeHtml.split("context\">");
                    tmp = tmp[1].split("<");
                    group = tmp[0].trim();

                    tmp = gradeHtml.split("points_possible\">");
                    tmp = tmp[1].split("<");
                    max = parseFloat(tmp[0].trim());

                    if (infoHtml.trim() != "") {
                        tmp = infoHtml.split("Mean:");
                        tmp = tmp[1].split("<");
                        avg = parseFloat(tmp[0].trim());
                    }

                    groups.push(group);
                    maxs.push(max);
                    avgs.push(avg);
                }

                /* Calculates percentages for each group */
                for (i = 0; i < groupNames.length; i++) {
                    var groupSum = 0;
                    var groupMax = 0;
                    for (j = 0; j < avgs.length; j++) {
                        if (groups[j] === groupNames[i]) {
                            groupSum += avgs[j];
                            groupMax += maxs[j];
                        }
                    }
                    var groupAvg = groupSum / groupMax;
                    groupAvg *= 100;
                    groupTotals.push(groupAvg);
                }

                /* Calculates weighting */
                var finalAvg = 0;
                for (i = 0; i < groupTotals.length; i++) {
                    if (!isNaN(groupTotals[i])) {
                        finalAvg += (groupTotals[i] * groupWeights[i]);
                    } else {
                        /* Assume people will do well on ungraded sections :) */
                        finalAvg += (100 * groupWeights[i]);
                    }
                }

                right.innerHTML = "<p class=\"student_assignment final_grade\" style=\"font-size: 1.2em;\">Class Average: " + finalAvg.toFixed(2) + "%</p>" + right.innerHTML;
                right.innerHTML += "<br>Note: Class Average assumes people will do perfectly on ungraded/future assignments.";
            }

        }
    }, 10);
});
