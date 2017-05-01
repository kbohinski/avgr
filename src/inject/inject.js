/**
 * @author Kevin Bohinski <bohinsk1@tcnj.edu>
 * @version 2.0
 * @since 2015-12-14
 *
 * Project Name:  Avgr
 * Description:   Calculates class averages for classes on canvas.
 *
 * Filename:      inject/inject.js
 * Description:   JS Injection that calculates class average and displays it.
 * Last Modified: 2017-4-30
 *
 * Copyright (c) 2015-2017 Kevin Bohinski. All rights reserved.
 */

'use strict'

chrome.extension.sendMessage({}, function (response) {
  let readyStateCheckInterval = setInterval(function () {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)

      /* If they are on a grade page, then do work */
      if (document.URL.search('grades') !== -1) {
        let el = document.getElementById.bind(document)

        let right = el('right-side')
        let assignments = $("[id^='submission'],[id^='score_details']")
        let unweighted = el('assignments-not-weighted').innerHTML.includes('Course assignments are not weighted')
        let categories = []
        if (!unweighted) {
          categories = el('assignments-not-weighted').getElementsByTagName('tbody')[0].getElementsByTagName('tr')
        } else {
          categories = ['all', 'all']
        }

        let groups = {}
        let numAssignments = 0
        let totalPts = 0

        // Ignore last to skip total row
        for (let i = 0; i < categories.length - 1; i++) {
          if (unweighted) {
            groups['all'] = {
              'weight': 1,
              'avgs': [],
              'total': 0,
              'avg': 0
            }
            break
          }
          groups[categories[i].getElementsByTagName('th')[0].innerText.trim()] = {
            'weight': (parseFloat(categories[i].getElementsByTagName('td')[0].innerText.trim()) / 100),
            'avgs': [],
            'total': 0,
            'avg': 0
          }
        }

        // Need group, avg, and out of
        let hasAvgs = false
        for (let i = 0; i < assignments.length; i++) {
          if (!assignments[i].classList.contains('assignment_graded')) {
            continue
          }
          if (assignments[i + 1].classList.contains('score_details_table')) {
            hasAvgs = true
          }
          let group = assignments[i].getElementsByClassName('context')[0].innerHTML.trim()
          if (unweighted) {
            group = 'all'
          }
          let avg = parseFloat(assignments[i + 1].getElementsByTagName('td')[0].innerText.trim().split(' ').pop())
          let outOf = parseFloat(assignments[i].getElementsByClassName('possible points_possible')[0].innerText.trim())
          if (isNaN(avg) || isNaN(outOf)) {
            continue
          }
          groups[group].avgs.push(avg)
          groups[group].total += outOf
          numAssignments++
          totalPts += outOf
        }

        for (let key in groups) {
          if (groups[key].weight === 0 || groups[key].avgs.length === 0) {
            groups[key].avg = 1
            continue
          }
          let sum = groups[key].avgs.reduce((a, b) => a + b, 0)
          groups[key].avg = (sum / groups[key].total) * 100
        }

        let classAvg = 0
        for (let key in groups) {
          classAvg += (groups[key].avg * groups[key].weight)
        }

        console.log(groups)

        let output = ''
        output += '<h3>avgr report</h3>'
        if (hasAvgs) {
          output += '<p><h4>class avg: ' + classAvg.toFixed(2) + '%</h4></p>'
          output += '<p><h4>num assignments: ' + numAssignments + '</h4></p>'
          output += '<p><h4>num total points: ' + totalPts + '</h4></p>'
        } else {
          output += '<p><h4>your prof disables averages... boo</h4></p>'
        }
        output += '<br><br>'

        right.innerHTML = output + right.innerHTML
      }

    }
  }, 10)
})
