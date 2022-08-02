---
layout: archive
title: "Data"
permalink: /data/
author_profile: true
---

{% include base_path %}

## The PARTYPRESS Database (published soon)
### A new Comparative Database 2022 of Parties’ Press Releases 
with Heike Klüver and Lukas F. Stoetzer (presented at EPSA 2022)
Github repository: [scripts-issue-agendas](https://github.com/cornelius-erfort/scripts-issue-agendas)

*Abstract:* We present the newly compiled PARTYPRESS Database which compiles more than 250,000 published press releases from 67 parties in nine European countries. The database covers the press releases of the most relevant political parties starting from 2010 onward. It provides a hand-labeled subset in 21 unique issue categories according to a general codebook. We discuss and evaluate different supervised machine learning approaches to obtain evolving issue agendas of the different parties. We extend a recent analysis in [Gessler & Hunger 2022](https://doi.org/10.1017/psrm.2021.64) to illustrate the usefulness of our approach in studying dynamic party competition, communication, and behavior.


## Election Dataset Germany 1953-2017
### County-level results made comparable over time using geodata and areal weighted interpolation
Github repository: [germany-53-17-districts](https://github.com/cornelius-erfort/germany-53-17-districts)

This repository provides historic, comparable county-level election results for West Germany since 1953. These can be easily merged with other historic data on the county level using offical county ID numbers (AGS, Allgemeiner Gemeindeschlüssel) that are also provided. 

The final dataset contains estimates for the vote share of all major parties for each election since 1953 (within the boundaries of the 2017 counties) obtained from areal weighted interpolation. 

In order to convert historic election results into the 2017 counties, I use geodata and areal weighted interpolation. More specifically, I calculate the share of historic counties that lie within the boundaries of 2017 counties. Subsequently, I multiply these shares with the election results of each year. This requires the assumption, that the vote share was distributed equally throughout the county.

The conversion of past into current counties benefits from the way that German counties were modified: Usually two or more old counties were merged entirely into a new one, often cities and the surrunding rural areas are combined. Only in rare cases, large parts of counties were reassigned.

The correlation of registered voters over time is very high. There seem to be no sudden changes in the size of the electorate suggesting that the conversion works quite well.
