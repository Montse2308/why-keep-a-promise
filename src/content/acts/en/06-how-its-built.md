---
act: 6
title: How it's built
deeper: how-its-built
---

This page is static: it is a set of plain files, built with Astro, a tool that turns code into web
pages, and TypeScript, a programming language that catches mistakes before the page is built.
Your browser runs a single script, a small program, and it is the table's. The table is drawn in
SVG, a format for describing shapes in code, with no frameworks, the large libraries many sites
load to build their interface.

Every figure is computed with exact arithmetic, as fractions of whole numbers, so nothing is
rounded until it is shown. The figures from Vanberg (2008) were recalculated from his public
supplementary data, with the method of his own code. Tests, small programs that check the code,
fail if any figure changes.

Behind the page there is a simulation engine, a program that works out what follows from a set of
rules, written in TypeScript. This page gives no details about it. Its code is at
<span class="todo">TODO(launch): enlace al repo del motor</span>.
